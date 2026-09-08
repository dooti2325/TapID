#include <iostream>
#include <cassert>
#include <string>
#include "../../firmware/esp32/offline_queue.h"

void test_initial_state() {
    OfflineQueue q;
    assert(q.isEmpty());
    assert(!q.isFull());
    assert(q.count() == 0);
    assert(q.capacity() == 50);

    QueuedTap tap;
    assert(!q.dequeue(tap));
    std::cout << "[PASS] test_initial_state\n";
}

void test_fifo_ordering() {
    OfflineQueue q;
    assert(q.enqueue("CARD_A", "2026-09-08T10:00:00Z"));
    assert(q.enqueue("CARD_B", "2026-09-08T10:00:05Z"));
    assert(q.enqueue("CARD_C", "2026-09-08T10:00:10Z"));

    assert(q.count() == 3);
    assert(!q.isEmpty());

    QueuedTap t1, t2, t3;
    assert(q.dequeue(t1));
    assert(t1.rfidUid == "CARD_A");
    assert(t1.timestamp == "2026-09-08T10:00:00Z");

    assert(q.dequeue(t2));
    assert(t2.rfidUid == "CARD_B");
    assert(t2.timestamp == "2026-09-08T10:00:05Z");

    assert(q.dequeue(t3));
    assert(t3.rfidUid == "CARD_C");
    assert(t3.timestamp == "2026-09-08T10:00:10Z");

    assert(q.isEmpty());
    assert(q.count() == 0);
    std::cout << "[PASS] test_fifo_ordering\n";
}

void test_capacity_and_overflow() {
    OfflineQueue q;
    for (size_t i = 0; i < q.capacity(); i++) {
        std::string uid = "UID_" + std::to_string(i);
        assert(q.enqueue(uid, "2026-09-08T12:00:00Z"));
    }

    assert(q.isFull());
    assert(q.count() == q.capacity());

    // Next enqueue must fail gracefully
    assert(!q.enqueue("OVERFLOW_CARD", "2026-09-08T12:01:00Z"));
    assert(q.count() == q.capacity());

    // Dequeue one, then enqueue should succeed
    QueuedTap tap;
    assert(q.dequeue(tap));
    assert(tap.rfidUid == "UID_0");
    assert(!q.isFull());

    assert(q.enqueue("OVERFLOW_CARD", "2026-09-08T12:01:00Z"));
    assert(q.isFull());
    std::cout << "[PASS] test_capacity_and_overflow\n";
}

void test_peek_and_clear() {
    OfflineQueue q;
    q.enqueue("CARD_1", "TS_1");
    q.enqueue("CARD_2", "TS_2");

    QueuedTap peeked;
    assert(q.peek(0, peeked));
    assert(peeked.rfidUid == "CARD_1");

    assert(q.peek(1, peeked));
    assert(peeked.rfidUid == "CARD_2");

    assert(!q.peek(2, peeked)); // Out of bounds

    assert(q.count() == 2);
    q.clear();
    assert(q.isEmpty());
    assert(q.count() == 0);
    std::cout << "[PASS] test_peek_and_clear\n";
}

void test_json_serialization() {
    OfflineQueue q;
    q.enqueue("A1B2C3D4", "2026-09-08T12:30:00Z");
    q.enqueue("E5F6G7H8", "2026-09-08T12:30:05Z");

    std::string expected = "[{\"rfid_uid\":\"A1B2C3D4\",\"timestamp\":\"2026-09-08T12:30:00Z\"},{\"rfid_uid\":\"E5F6G7H8\",\"timestamp\":\"2026-09-08T12:30:05Z\"}]";
    std::string actual = q.serializeToJson();

    assert(actual == expected);

    // Test partial batch serialization (maxItems = 1)
    std::string partialExpected = "[{\"rfid_uid\":\"A1B2C3D4\",\"timestamp\":\"2026-09-08T12:30:00Z\"}]";
    std::string partialActual = q.serializeToJson(1);
    assert(partialActual == partialExpected);

    std::cout << "[PASS] test_json_serialization\n";
}

int main() {
    std::cout << "Running TapID Firmware Offline Queue Unit Tests...\n";
    test_initial_state();
    test_fifo_ordering();
    test_capacity_and_overflow();
    test_peek_and_clear();
    test_json_serialization();
    std::cout << "All firmware unit tests PASSED successfully!\n";
    return 0;
}
