#include "attendance.h"

AttendanceController::AttendanceController()
    : _rfid(SS_PIN, RST_PIN),
      _buzzer(BUZZER_PIN),
      _led(LED_GREEN_PIN, LED_RED_PIN),
      _lastQueueFlushAttempt(0),
      _wasOnline(false) {}

void AttendanceController::begin() {
    Serial.println("==================================================");
    Serial.println("         TapID ESP32 Attendance Terminal          ");
    Serial.println("==================================================");

    _buzzer.init();
    _led.init();

    // Startup visual and audio chime
    _led.showBoot();
    _buzzer.playBoot();

    // Initialize RFID Reader
    if (!_rfid.init()) {
        Serial.println("[ERROR] RFID Reader initialization failed!");
        _led.showError();
        _buzzer.playError();
    }

    // Initialize WiFi
    _wifi.begin();

    if (_wifi.isConnected()) {
        _wasOnline = true;
        _led.showReady();
        _buzzer.playWiFiConnected();
        _api.updateDeviceStatus(_wifi.getMacAddress(), "online");
    } else {
        _wasOnline = false;
        _led.setRed(true);
        Serial.println("[INFO] Terminal starting in Offline Buffering Mode.");
    }

    Serial.printf("[READY] TapID Terminal Ready on MAC: %s\n\n", _wifi.getMacAddress().c_str());
}

void AttendanceController::provideFeedback(const AttendanceResponse& res) {
    switch (res.status) {
        case STATUS_SUCCESS:
            Serial.printf("[ATTENDANCE] SUCCESS: %s (%s)\n", res.studentName.c_str(), res.message.c_str());
            _led.showSuccess();
            _buzzer.playSuccess();
            break;

        case STATUS_DUPLICATE:
            Serial.println("[ATTENDANCE] WARNING: Duplicate attendance already recorded for this session.");
            _led.showDuplicate();
            _buzzer.playDuplicate();
            break;

        case STATUS_NO_SESSION:
            Serial.println("[ATTENDANCE] REJECTED: No active attendance session for this classroom.");
            _led.showError();
            _buzzer.playError();
            break;

        case STATUS_DEVICE_INVALID:
            Serial.println("[ATTENDANCE] REJECTED: Device is not authorized, invalid, or revoked.");
            _led.showError();
            _buzzer.playError();
            break;

        case STATUS_CARD_NOT_FOUND:
            Serial.println("[ATTENDANCE] REJECTED: RFID Card not registered or student not found.");
            _led.showError();
            _buzzer.playError();
            break;

        case STATUS_NETWORK_ERROR:
        case STATUS_SERVER_ERROR:
        default:
            Serial.printf("[ATTENDANCE] ERROR: Server/Network failure (HTTP %d: %s)\n", res.httpCode, res.message.c_str());
            _led.showError();
            _buzzer.playError();
            break;
    }
}

void AttendanceController::handleTap(const String& uid) {
    Serial.printf("\n[TAP] RFID Card Detected: %s\n", uid.c_str());
    _buzzer.playTap();

    if (_wifi.isConnected()) {
        AttendanceResponse res = _api.recordAttendance(uid, _wifi.getMacAddress());

        if (res.status == STATUS_NETWORK_ERROR) {
            // Network request dropped during transmission, buffer locally
            Serial.println("[WARN] Request failed. Switching to offline queue for this tap.");
            String ts = _wifi.getISOTimestamp();
            if (_queue.enqueue(uid, ts)) {
                Serial.printf("[QUEUE] Tap buffered offline (Queue size: %u)\n", (unsigned int)_queue.count());
                _led.showOfflineBuffered();
                _buzzer.playOfflineBuffered();
            } else {
                Serial.println("[QUEUE] ERROR: Buffer full! Tap could not be stored.");
                _led.showError();
                _buzzer.playError();
            }
        } else {
            provideFeedback(res);
        }
    } else {
        // Device is offline - buffer the tap
        String ts = _wifi.getISOTimestamp();
        if (_queue.enqueue(uid, ts)) {
            Serial.printf("[OFFLINE] Buffered tap %s at %s (Queue size: %u/%u)\n",
                uid.c_str(), ts.c_str(), (unsigned int)_queue.count(), (unsigned int)_queue.capacity());
            _led.showOfflineBuffered();
            _buzzer.playOfflineBuffered();
        } else {
            Serial.printf("[OFFLINE] ERROR: Queue full (%u)! Tap dropped.\n", (unsigned int)_queue.capacity());
            _led.showError();
            _buzzer.playError();
        }
    }
}

void AttendanceController::flushOfflineQueue() {
    if (_queue.isEmpty() || !_wifi.isConnected()) {
        return;
    }

    unsigned long now = millis();
    if (now - _lastQueueFlushAttempt < QUEUE_FLUSH_INTERVAL_MS) {
        return;
    }
    _lastQueueFlushAttempt = now;

    size_t batchSize = (_queue.count() > 20) ? 20 : _queue.count();
    String jsonArray = _queue.serializeToJson(batchSize);

    Serial.printf("[QUEUE] Flushing %u buffered tap(s) via bulk endpoint...\n", (unsigned int)batchSize);

    AttendanceResponse res = _api.bulkRecordAttendance(_wifi.getMacAddress(), jsonArray);

    if (res.status == STATUS_SUCCESS) {
        Serial.printf("[QUEUE] Batch sync complete. Added: %d, Errors: %d\n", res.bulkAdded, res.bulkErrors);
        QueuedTap dummy;
        for (size_t i = 0; i < batchSize; i++) {
            _queue.dequeue(dummy);
        }
        _buzzer.beep(2400, 80);
    } else if (res.status == STATUS_NETWORK_ERROR) {
        Serial.println("[QUEUE] Bulk sync failed due to network error. Will retry.");
    } else {
        Serial.printf("[QUEUE] Bulk sync rejected by backend: %s. Clearing invalid batch.\n", res.message.c_str());
        QueuedTap dummy;
        for (size_t i = 0; i < batchSize; i++) {
            _queue.dequeue(dummy);
        }
    }
}

void AttendanceController::loop() {
    _wifi.loop();

    // Flush any pending offline taps when online
    if (_wifi.isConnected()) {
        if (!_wasOnline) {
            _wasOnline = true;
            _api.updateDeviceStatus(_wifi.getMacAddress(), "online");
        }
        _led.setGreen(true);
        _led.setRed(false);
        flushOfflineQueue();
    } else {
        _wasOnline = false;
        // Red indicator for offline status
        _led.setGreen(false);
        _led.setRed(true);
    }

    // Check for RFID card
    if (!_rfid.isCardPresent()) {
        delay(20);
        return;
    }

    String uid = _rfid.readCardUID();
    _rfid.halt();

    if (uid.length() == 0) {
        return;
    }

    // Check debounce cooldown
    if (!_rfid.isDebounced(uid)) {
        delay(50);
        return;
    }

    handleTap(uid);
}
