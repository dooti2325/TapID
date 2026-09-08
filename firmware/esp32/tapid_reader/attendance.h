#ifndef ATTENDANCE_H
#define ATTENDANCE_H

#include <Arduino.h>
#include "config.h"
#include "secrets.h"
#include "wifi_manager.h"
#include "rfid_reader.h"
#include "buzzer.h"
#include "led.h"
#include "api_client.h"
#include "offline_queue.h"

class AttendanceController {
public:
    AttendanceController();

    void begin();
    void loop();

    void flushOfflineQueue();
    void handleTap(const String& uid);

private:
    WiFiManager _wifi;
    RfidReader _rfid;
    Buzzer _buzzer;
    LedIndicator _led;
    ApiClient _api;
    OfflineQueue _queue;

    unsigned long _lastQueueFlushAttempt;
    void provideFeedback(const AttendanceResponse& res);
};

#endif // ATTENDANCE_H
