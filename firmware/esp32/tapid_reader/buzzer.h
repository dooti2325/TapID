#ifndef BUZZER_H
#define BUZZER_H

#include <Arduino.h>

class Buzzer {
public:
    explicit Buzzer(uint8_t pin);
    void init();

    // Specific acoustic feedback signals
    void playBoot();
    void playTap();
    void playSuccess();
    void playDuplicate();
    void playError();
    void playOfflineBuffered();
    void playWiFiConnected();
    void playWiFiLost();

    // Generic beep
    void beep(unsigned int frequency, unsigned long durationMs);
    void stop();

private:
    uint8_t _pin;
};

#endif // BUZZER_H
