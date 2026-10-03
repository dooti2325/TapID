#include "led.h"

LedIndicator::LedIndicator(uint8_t wifiGreenPin,
                           uint8_t wifiRedPin,
                           uint8_t attendGreenPin,
                           uint8_t attendRedPin)
    : _pinWifiGreen(wifiGreenPin),
      _pinWifiRed(wifiRedPin),
      _pinAttendGreen(attendGreenPin),
      _pinAttendRed(attendRedPin),
      _wifiConnected(false),
      _wifiConnecting(false),
      _configPortalActive(false),
      _attendState(ATTEND_LED_IDLE),
      _attendActionStartTime(0),
      _lastBlinkTime(0),
      _strobeState(false) {}

void LedIndicator::init() {
    pinMode(_pinWifiGreen, OUTPUT);
    pinMode(_pinWifiRed, OUTPUT);
    pinMode(_pinAttendGreen, OUTPUT);
    pinMode(_pinAttendRed, OUTPUT);

    digitalWrite(_pinWifiGreen, LOW);
    digitalWrite(_pinWifiRed, LOW);
    digitalWrite(_pinAttendGreen, LOW);
    digitalWrite(_pinAttendRed, LOW);
}

void LedIndicator::showBoot() {
    // LED self-test wave
    digitalWrite(_pinWifiGreen, HIGH); delay(80);
    digitalWrite(_pinWifiRed, HIGH); delay(80);
    digitalWrite(_pinAttendGreen, HIGH); delay(80);
    digitalWrite(_pinAttendRed, HIGH); delay(150);

    digitalWrite(_pinWifiGreen, LOW);
    digitalWrite(_pinWifiRed, LOW);
    digitalWrite(_pinAttendGreen, LOW);
    digitalWrite(_pinAttendRed, LOW);
}

void LedIndicator::setWifiConnected(bool connected) {
    _wifiConnected = connected;
    _wifiConnecting = false;
    _configPortalActive = false;

    if (connected) {
        digitalWrite(_pinWifiGreen, HIGH);
        digitalWrite(_pinWifiRed, LOW);
    } else {
        digitalWrite(_pinWifiGreen, LOW);
        digitalWrite(_pinWifiRed, HIGH);
    }
}

void LedIndicator::setWifiConnecting(bool connecting) {
    _wifiConnecting = connecting;
    if (connecting) {
        _wifiConnected = false;
        digitalWrite(_pinWifiGreen, LOW);
    }
}

void LedIndicator::setConfigPortalActive(bool active) {
    _configPortalActive = active;
}

void LedIndicator::showSuccess() {
    _attendState = ATTEND_LED_SUCCESS;
    _attendActionStartTime = millis();
    digitalWrite(_pinAttendGreen, HIGH);
    digitalWrite(_pinAttendRed, LOW);
}

void LedIndicator::showError() {
    _attendState = ATTEND_LED_ERROR;
    _attendActionStartTime = millis();
    digitalWrite(_pinAttendGreen, LOW);
    digitalWrite(_pinAttendRed, HIGH);
}

void LedIndicator::showWrongSection() {
    showError();
}

void LedIndicator::showDuplicate() {
    showError();
}

void LedIndicator::showProxyWarning() {
    _attendState = ATTEND_LED_PROXY_STROBE;
    _attendActionStartTime = millis();
    digitalWrite(_pinAttendGreen, LOW);
    _strobeState = true;
    digitalWrite(_pinAttendRed, HIGH);
}

void LedIndicator::showOfflineBuffered() {
    // Both attendance LEDs on briefly for offline buffer indicator
    _attendState = ATTEND_LED_ERROR;
    _attendActionStartTime = millis();
    digitalWrite(_pinAttendGreen, HIGH);
    digitalWrite(_pinAttendRed, HIGH);
}

void LedIndicator::clearAttendanceLeds() {
    _attendState = ATTEND_LED_IDLE;
    digitalWrite(_pinAttendGreen, LOW);
    digitalWrite(_pinAttendRed, LOW);
}

bool LedIndicator::isReadyForTap() const {
    return (_attendState == ATTEND_LED_IDLE);
}

void LedIndicator::update(unsigned long currentMillis) {
    // 1. Wi-Fi status LED animations
    if (_configPortalActive) {
        if (currentMillis - _lastBlinkTime >= 250) {
            _lastBlinkTime = currentMillis;
            _strobeState = !_strobeState;
            digitalWrite(_pinWifiGreen, _strobeState ? HIGH : LOW);
            digitalWrite(_pinWifiRed, _strobeState ? LOW : HIGH);
        }
    } else if (_wifiConnecting) {
        if (currentMillis - _lastBlinkTime >= 400) {
            _lastBlinkTime = currentMillis;
            _strobeState = !_strobeState;
            digitalWrite(_pinWifiRed, _strobeState ? HIGH : LOW);
            digitalWrite(_pinWifiGreen, LOW);
        }
    } else {
        digitalWrite(_pinWifiGreen, _wifiConnected ? HIGH : LOW);
        digitalWrite(_pinWifiRed, _wifiConnected ? LOW : HIGH);
    }

    // 2. Attendance Feedback Timer (Turns off after exactly 3 seconds)
    if (_attendState != ATTEND_LED_IDLE) {
        if (currentMillis - _attendActionStartTime >= TAP_FEEDBACK_DURATION_MS) {
            // 3 seconds elapsed: Turn off attendance indicators to signal ready for another tap
            clearAttendanceLeds();
        } else if (_attendState == ATTEND_LED_PROXY_STROBE) {
            // High-speed strobe warning pattern for proxy attendance
            if (currentMillis - _lastBlinkTime >= 80) {
                _lastBlinkTime = currentMillis;
                _strobeState = !_strobeState;
                digitalWrite(_pinAttendRed, _strobeState ? HIGH : LOW);
            }
        }
    }
}
