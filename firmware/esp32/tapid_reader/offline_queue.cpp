#include "offline_queue.h"

OfflineQueue::OfflineQueue() : _head(0), _tail(0), _count(0) {}

bool OfflineQueue::enqueue(const String& uid, const String& timestamp) {
    if (isFull()) {
        return false;
    }

    _buffer[_tail].rfidUid = uid;
    _buffer[_tail].timestamp = timestamp;
    _tail = (_tail + 1) % OFFLINE_BUFFER_CAPACITY;
    _count++;
    return true;
}

bool OfflineQueue::dequeue(QueuedTap& outTap) {
    if (isEmpty()) {
        return false;
    }

    outTap = _buffer[_head];
    _head = (_head + 1) % OFFLINE_BUFFER_CAPACITY;
    _count--;
    return true;
}

bool OfflineQueue::peek(size_t index, QueuedTap& outTap) const {
    if (index >= _count) {
        return false;
    }

    size_t actualIndex = (_head + index) % OFFLINE_BUFFER_CAPACITY;
    outTap = _buffer[actualIndex];
    return true;
}

bool OfflineQueue::isEmpty() const {
    return (_count == 0);
}

bool OfflineQueue::isFull() const {
    return (_count >= OFFLINE_BUFFER_CAPACITY);
}

size_t OfflineQueue::count() const {
    return _count;
}

size_t OfflineQueue::capacity() const {
    return OFFLINE_BUFFER_CAPACITY;
}

void OfflineQueue::clear() {
    _head = 0;
    _tail = 0;
    _count = 0;
}

String OfflineQueue::serializeToJson(size_t maxItems) const {
    size_t itemsToProcess = _count;
    if (maxItems > 0 && maxItems < itemsToProcess) {
        itemsToProcess = maxItems;
    }

    String json = "[";
    for (size_t i = 0; i < itemsToProcess; i++) {
        size_t actualIdx = (_head + i) % OFFLINE_BUFFER_CAPACITY;
        if (i > 0) {
            json += ",";
        }
        json += "{\"rfid_uid\":\"";
        json += _buffer[actualIdx].rfidUid;
        json += "\",\"timestamp\":\"";
        json += _buffer[actualIdx].timestamp;
        json += "\"}";
    }
    json += "]";
    return json;
}
