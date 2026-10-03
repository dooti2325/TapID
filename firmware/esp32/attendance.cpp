#include "attendance.h"

AttendanceController::AttendanceController()
    : _rfid(SS_PIN, RST_PIN),
      _buzzer(PIN_BUZZER),
      _led(PIN_LED_WIFI_GREEN, PIN_LED_WIFI_RED, PIN_LED_ATTEND_GREEN, PIN_LED_ATTEND_RED),
      _sessionActive(false),
      _activeSessionId(0),
      _lastHeartbeat(0),
      _lastTappedUid(""),
      _lastTapTime(0),
      _lastQueueFlushAttempt(0),
      _wasOnline(false),
      _buttonPressStart(0),
      _buttonPressed(false) {}

void AttendanceController::begin() {
    Serial.println("==================================================");
    Serial.println("        TapID Enterprise ESP32 Terminal           ");
    Serial.println("==================================================");

    // Initialize physical indicators and buttons
    _buzzer.init();
    _led.init();

#if ENABLE_CONFIG_BUTTON
    pinMode(PIN_CONFIG_BUTTON, INPUT_PULLUP);
#endif

    // Startup visual sequence and power-up chime
    _led.showBoot();
    _buzzer.playBoot();

    // Initialize RFID Reader (RC522)
    if (!_rfid.init()) {
        Serial.println("[ERROR] RC522 RFID Reader initialization failed! Check SPI wiring.");
        _led.showError();
        _buzzer.playAttendanceError();
    } else {
        Serial.println("[HARDWARE] RC522 RFID Reader initialized successfully.");
    }

    // Initialize Wi-Fi Manager
    _wifi.begin();

    // Configure API client with effective URLs and Keys
    _api.setBaseUrl(_wifi.getEffectiveServerUrl());
    _api.setApiKey(_wifi.getEffectiveApiKey());

    if (_wifi.isConnected()) {
        _wasOnline = true;
        _led.setWifiConnected(true);
        _buzzer.playWiFiConnected();
        _ota.begin();
        performHeartbeat();
    } else {
        _wasOnline = false;
        _led.setWifiConnected(false);
        Serial.println("[INFO] Terminal starting in Offline Buffering Mode.");
    }

    Serial.printf("[READY] TapID Terminal Ready on MAC: %s\n\n", _wifi.getMacAddress().c_str());
}

void AttendanceController::checkButton() {
#if ENABLE_CONFIG_BUTTON
    bool pressed = (digitalRead(PIN_CONFIG_BUTTON) == LOW);

    if (pressed && !_buttonPressed) {
        _buttonPressed = true;
        _buttonPressStart = millis();
    } else if (!pressed && _buttonPressed) {
        unsigned long duration = millis() - _buttonPressStart;
        _buttonPressed = false;

        // Press between 3 and 10 seconds: Launch Wi-Fi AP Config Portal
        if (duration >= 3000 && duration < 10000) {
            Serial.println("[BUTTON] 3s Hold detected -> Starting Wi-Fi AP Setup Portal...");
            _buzzer.beep(2200, 150);
            _wifi.startConfigPortal();
            _led.setConfigPortalActive(true);
        }
    }
#endif
}

void AttendanceController::performHeartbeat() {
    if (!_wifi.isConnected()) return;

    HeartbeatResponse res = _api.sendHeartbeat(_wifi.getMacAddress());

    if (res.success) {
        // Check for session state transition: Faculty started lecture
        if (res.hasActiveSession && !_sessionActive) {
            _sessionActive = true;
            _activeSessionId = res.sessionId;
            _currentSubject = res.subjectName;
            _currentFaculty = res.facultyName;
            _currentSection = res.sectionName;

            Serial.println("\n**************************************************");
            Serial.printf("[LECTURE STARTED] %s by %s (%s)\n",
                          _currentSubject.c_str(), _currentFaculty.c_str(), _currentSection.c_str());
            Serial.println("Terminal is now ACTIVE for student attendance taps.");
            Serial.println("**************************************************\n");

            // Buzzer chime when faculty starts attendance!
            _buzzer.playSessionStarted();
        } else if (!res.hasActiveSession && _sessionActive) {
            _sessionActive = false;
            Serial.println("\n[LECTURE CONCLUDED] Faculty ended lecture session. Terminal in STANDBY.\n");
            _buzzer.playSessionEnded();
        } else if (res.hasActiveSession && _sessionActive) {
            // Session ongoing
            _activeSessionId = res.sessionId;
        }
    }
}

void AttendanceController::provideFeedback(const AttendanceResponse& res) {
    switch (res.status) {
        case STATUS_SUCCESS:
            // Correct-section student -> Present + blink green LED + beep
            Serial.printf("[ATTENDANCE] PRESENT: %s\n", res.studentName.c_str());
            _led.showSuccess();
            _buzzer.playAttendanceSuccess();
            break;

        case STATUS_WRONG_SECTION:
            // Wrong-section student -> Invalid + blink red LED + beep
            Serial.printf("[ATTENDANCE] REJECTED: %s is from a different section! (Expected: %s, Student: %s)\n",
                          res.studentName.c_str(), res.expectedSection.c_str(), res.studentSection.c_str());
            _led.showWrongSection();
            _buzzer.playAttendanceWrongSection();
            break;

        case STATUS_DUPLICATE:
            // Duplicate tap -> Don't mark attendance again + quick warning
            Serial.println("[ATTENDANCE] DUPLICATE: Attendance already recorded for this lecture.");
            _led.showDuplicate();
            _buzzer.playAttendanceDuplicate();
            break;

        case STATUS_PROXY_DETECTED:
            // Two different IDs within 3 seconds -> Proxy warning pattern
            Serial.println("[SECURITY] PROXY ATTEMPT FLAGGED: Rapid multi-card scan detected!");
            _led.showProxyWarning();
            _buzzer.playProxyWarning();
            break;

        case STATUS_NO_SESSION:
            // Device becomes active only when faculty starts attendance
            Serial.println("[ATTENDANCE] REJECTED: No active lecture session started by faculty for this room.");
            _led.showError();
            _buzzer.playAttendanceError();
            break;

        case STATUS_CARD_NOT_FOUND:
            // Unknown / unassigned card ID -> Red LED + error beep
            Serial.println("[ATTENDANCE] REJECTED: Unknown or unassigned RFID Card.");
            _led.showError();
            _buzzer.playAttendanceError();
            break;

        case STATUS_DEVICE_INVALID:
            Serial.println("[SECURITY] REJECTED: This hardware device is unauthorized or revoked.");
            _led.showError();
            _buzzer.playAttendanceError();
            break;

        case STATUS_NETWORK_ERROR:
        case STATUS_SERVER_ERROR:
        default:
            Serial.printf("[ATTENDANCE] Server/Network error (HTTP %d: %s)\n", res.httpCode, res.message.c_str());
            _led.showError();
            _buzzer.playAttendanceError();
            break;
    }
}

void AttendanceController::handleTap(const String& uid) {
    unsigned long now = millis();
    Serial.printf("\n[TAP] Card Scanned: %s\n", uid.c_str());
    _buzzer.playTap();

    // -------------------------------------------------------------------------
    // Anti-Proxy Detection: Two different card IDs tapped within 3 seconds!
    // -------------------------------------------------------------------------
    bool proxyDetected = false;
    if (_lastTappedUid.length() > 0 &&
        uid != _lastTappedUid &&
        (now - _lastTapTime) < PROXY_DETECTION_WINDOW_MS) {

        Serial.printf("[SECURITY WARNING] PROXY DETECTED! Card %s tapped %lums after %s!\n",
                      uid.c_str(), (now - _lastTapTime), _lastTappedUid.c_str());

        proxyDetected = true;
        _led.showProxyWarning();
        _buzzer.playProxyWarning();
    }

    _lastTappedUid = uid;
    _lastTapTime = now;

    // -------------------------------------------------------------------------
    // Session Active Check: Device only marks attendance when faculty started
    // -------------------------------------------------------------------------
    if (!_sessionActive && !proxyDetected) {
        Serial.println("[ATTENDANCE] Notice: Standby mode. Faculty has not started attendance yet.");
        // Try live query if online in case faculty just started within the last heartbeat window
        if (_wifi.isConnected()) {
            performHeartbeat();
        }

        if (!_sessionActive) {
            _led.showError();
            _buzzer.playAttendanceError();
            return;
        }
    }

    // -------------------------------------------------------------------------
    // Online / Offline Submission
    // -------------------------------------------------------------------------
    if (_wifi.isConnected()) {
        AttendanceResponse res = _api.recordAttendance(uid, _wifi.getMacAddress(), proxyDetected);

        if (res.status == STATUS_NETWORK_ERROR) {
            // Fallback to offline buffer if network drops during transmission
            Serial.println("[WARN] Transmission dropped. Buffering tap to offline storage.");
            String ts = _wifi.getISOTimestamp();
            if (_queue.enqueue(uid, ts)) {
                Serial.printf("[QUEUE] Tap buffered offline (Queue size: %u)\n", (unsigned int)_queue.count());
                _led.showOfflineBuffered();
                _buzzer.playOfflineBuffered();
            } else {
                Serial.println("[QUEUE] Buffer full! Tap dropped.");
                _led.showError();
                _buzzer.playAttendanceError();
            }
        } else {
            provideFeedback(res);
        }
    } else {
        // Fail-safe Offline Buffering Mode
        String ts = _wifi.getISOTimestamp();
        if (_queue.enqueue(uid, ts)) {
            Serial.printf("[OFFLINE] Buffered tap %s at %s (Queue size: %u/%u)\n",
                          uid.c_str(), ts.c_str(), (unsigned int)_queue.count(), (unsigned int)_queue.capacity());
            _led.showOfflineBuffered();
            _buzzer.playOfflineBuffered();
        } else {
            Serial.printf("[OFFLINE] Buffer full (%u)! Tap dropped.\n", (unsigned int)_queue.capacity());
            _led.showError();
            _buzzer.playAttendanceError();
        }
    }
}

void AttendanceController::flushOfflineQueue() {
    if (_queue.isEmpty() || !_wifi.isConnected()) return;

    unsigned long now = millis();
    if (now - _lastQueueFlushAttempt < QUEUE_FLUSH_INTERVAL_MS) return;
    _lastQueueFlushAttempt = now;

    size_t batchSize = (_queue.count() > 20) ? 20 : _queue.count();
    String jsonArray = _queue.serializeToJson(batchSize);

    Serial.printf("[QUEUE] Syncing %u offline buffered tap(s) with server...\n", (unsigned int)batchSize);

    AttendanceResponse res = _api.bulkRecordAttendance(_wifi.getMacAddress(), jsonArray);

    if (res.status == STATUS_SUCCESS) {
        Serial.printf("[QUEUE] Batch sync successful. Added: %d, Errors: %d\n", res.bulkAdded, res.bulkErrors);
        QueuedTap dummy;
        for (size_t i = 0; i < batchSize; i++) {
            _queue.dequeue(dummy);
        }
        _buzzer.beep(2400, 80);
    } else if (res.status == STATUS_NETWORK_ERROR) {
        Serial.println("[QUEUE] Sync attempt failed (network error). Retrying later.");
    } else {
        Serial.printf("[QUEUE] Sync batch processed by server: %s.\n", res.message.c_str());
        QueuedTap dummy;
        for (size_t i = 0; i < batchSize; i++) {
            _queue.dequeue(dummy);
        }
    }
}

void AttendanceController::loop() {
    unsigned long now = millis();

    // Check Wi-Fi state & handle config portal
    _wifi.loop();

    // Check physical button for AP setup or factory reset
    checkButton();

    // Update non-blocking LEDs (turns off after exactly 3 seconds)
    _led.update(now);

    // Wi-Fi Connection State Transitions & Indicators
    if (_wifi.isConnected()) {
        if (!_wasOnline) {
            _wasOnline = true;
            _led.setWifiConnected(true);
            _buzzer.playWiFiConnected();
            _api.updateDeviceStatus(_wifi.getMacAddress(), "online");
            performHeartbeat();
        }

        // Flush offline records when internet is available
        flushOfflineQueue();

        // Handle Over-The-Air firmware updates
        _ota.handle();

        // Periodic Heartbeat & Session Sync (every 10s)
        if (now - _lastHeartbeat >= HEARTBEAT_INTERVAL_MS) {
            _lastHeartbeat = now;
            performHeartbeat();
        }
    } else {
        if (_wasOnline) {
            _wasOnline = false;
            _led.setWifiConnected(false);
            _buzzer.playWiFiLost();
        }
    }

    // Do not scan cards if AP configuration portal is open
    if (_wifi.isConfigPortalActive()) {
        delay(30);
        return;
    }

    // Check for RFID card presence
    if (!_rfid.isCardPresent()) {
        delay(20);
        return;
    }

    String uid = _rfid.readCardUID();
    _rfid.halt();

    if (uid.length() == 0) return;

    // Check card debounce cooldown
    if (!_rfid.isDebounced(uid)) {
        delay(40);
        return;
    }

    handleTap(uid);
}
