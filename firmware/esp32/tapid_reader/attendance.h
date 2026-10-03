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
#include "ota_manager.h"

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
    OtaManager _ota;

    // Session State Tracking
    bool _sessionActive;
    int _activeSessionId;
    String _currentSubject;
    String _currentFaculty;
    String _currentSection;
    unsigned long _lastHeartbeat;

    // Anti-Proxy Detection State
    String _lastTappedUid;
    unsigned long _lastTapTime;

    // Offline & Connection State
    unsigned long _lastQueueFlushAttempt;
    bool _wasOnline;

    // Button Handling
    unsigned long _buttonPressStart;
    bool _buttonPressed;

    void checkButton();
    void performHeartbeat();
    void provideFeedback(const AttendanceResponse& res);
};

#endif // ATTENDANCE_H
