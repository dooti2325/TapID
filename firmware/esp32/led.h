#ifndef LED_H
#define LED_H

#include <Arduino.h>
#include "config.h"

enum AttendLedState {
    ATTEND_LED_IDLE,
    ATTEND_LED_SUCCESS,
    ATTEND_LED_ERROR,
    ATTEND_LED_PROXY_STROBE
};

class LedIndicator {
public:
    LedIndicator(uint8_t wifiGreenPin = PIN_LED_WIFI_GREEN,
                 uint8_t wifiRedPin = PIN_LED_WIFI_RED,
                 uint8_t attendGreenPin = PIN_LED_ATTEND_GREEN,
                 uint8_t attendRedPin = PIN_LED_ATTEND_RED);

    void init();

    // Wi-Fi Connection Indicators
    void setWifiConnected(bool connected);
    void setWifiConnecting(bool connecting);
    void setConfigPortalActive(bool active);

    // Attendance Tap Indicators (Active for 3 seconds, then auto-off)
    void showSuccess();
    void showError();
    void showWrongSection();
    void showDuplicate();
    void showProxyWarning();
    void showOfflineBuffered();
    void showBoot();
    void clearAttendanceLeds();

    // Non-blocking update called every loop() cycle
    void update(unsigned long currentMillis);

    // Check if terminal is ready for another tap (feedback window complete)
    bool isReadyForTap() const;

private:
    uint8_t _pinWifiGreen;
    uint8_t _pinWifiRed;
    uint8_t _pinAttendGreen;
    uint8_t _pinAttendRed;

    bool _wifiConnected;
    bool _wifiConnecting;
    bool _configPortalActive;

    AttendLedState _attendState;
    unsigned long _attendActionStartTime;
    unsigned long _lastBlinkTime;
    bool _strobeState;
};

#endif // LED_H
