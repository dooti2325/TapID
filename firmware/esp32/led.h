#ifndef LED_H
#define LED_H

#include <Arduino.h>

class LedIndicator {
public:
    LedIndicator(uint8_t greenPin, uint8_t redPin);
    void init();

    void setGreen(bool on);
    void setRed(bool on);
    void allOff();

    void flashGreen(unsigned long durationMs = 400);
    void flashRed(unsigned long durationMs = 500);
    void flashBoth(unsigned long durationMs = 300);

    void showBoot();
    void showReady();
    void showSuccess();
    void showDuplicate();
    void showError();
    void showOfflineBuffered();

    // Cooperative non-blocking update for connection states
    void updateConnecting(unsigned long currentMillis);

private:
    uint8_t _greenPin;
    uint8_t _redPin;
    unsigned long _lastToggleTime;
    bool _toggleState;
};

#endif // LED_H
