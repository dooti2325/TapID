#ifndef OFFLINE_QUEUE_H
#define OFFLINE_QUEUE_H

#ifdef ARDUINO
#include <Arduino.h>
#else
#include <string>
#include <stdint.h>
#include <cstdio>
typedef std::string String;
#endif

#include "config.h"

struct QueuedTap {
    String rfidUid;
    String timestamp;
};

class OfflineQueue {
public:
    OfflineQueue();

    bool enqueue(const String& uid, const String& timestamp);
    bool dequeue(QueuedTap& outTap);
    bool peek(size_t index, QueuedTap& outTap) const;

    bool isEmpty() const;
    bool isFull() const;
    size_t count() const;
    size_t capacity() const;
    void clear();

    // Serialize queue into JSON array string matching backend bulk-record format:
    // [{"rfid_uid":"...","timestamp":"..."}, ...]
    String serializeToJson(size_t maxItems = 0) const;

private:
    QueuedTap _buffer[OFFLINE_BUFFER_CAPACITY];
    size_t _head;
    size_t _tail;
    size_t _count;
};

#endif // OFFLINE_QUEUE_H
