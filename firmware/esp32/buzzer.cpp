#include "buzzer.h"

Buzzer::Buzzer(uint8_t pin) : _pin(pin) {}

void Buzzer::init() {
    pinMode(_pin, OUTPUT);
    digitalWrite(_pin, LOW);
}

void Buzzer::beep(unsigned int frequency, unsigned long durationMs) {
    (void)frequency;
    digitalWrite(_pin, HIGH);
    delay(durationMs);
    digitalWrite(_pin, LOW);
}

void Buzzer::stop() {
    digitalWrite(_pin, LOW);
}

void Buzzer::playBoot() {
    digitalWrite(_pin, HIGH);
    delay(80);
    digitalWrite(_pin, LOW);
    delay(80);
    digitalWrite(_pin, HIGH);
    delay(120);
    digitalWrite(_pin, LOW);
}

void Buzzer::playTap() {
    digitalWrite(_pin, HIGH);
    delay(50);
    digitalWrite(_pin, LOW);
}

void Buzzer::playSuccess() {
    // One short beep (200ms) - Access Granted pattern
    digitalWrite(_pin, HIGH);
    delay(200);
    digitalWrite(_pin, LOW);
}

void Buzzer::playDuplicate() {
    for (int i = 0; i < 2; i++) {
        digitalWrite(_pin, HIGH);
        delay(80);
        digitalWrite(_pin, LOW);
        delay(80);
    }
}

void Buzzer::playError() {
    // Three short beeps (150ms on / 150ms off) - Access Denied pattern
    for (int i = 0; i < 3; i++) {
        digitalWrite(_pin, HIGH);
        delay(150);
        digitalWrite(_pin, LOW);
        delay(150);
    }
}

void Buzzer::playOfflineBuffered() {
    digitalWrite(_pin, HIGH);
    delay(80);
    digitalWrite(_pin, LOW);
    delay(100);
    digitalWrite(_pin, HIGH);
    delay(80);
    digitalWrite(_pin, LOW);
}

void Buzzer::playWiFiConnected() {
    digitalWrite(_pin, HIGH);
    delay(100);
    digitalWrite(_pin, LOW);
    delay(100);
    digitalWrite(_pin, HIGH);
    delay(150);
    digitalWrite(_pin, LOW);
}

void Buzzer::playWiFiLost() {
    digitalWrite(_pin, HIGH);
    delay(300);
    digitalWrite(_pin, LOW);
}
