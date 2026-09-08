#include "buzzer.h"

Buzzer::Buzzer(uint8_t pin) : _pin(pin) {}

void Buzzer::init() {
    pinMode(_pin, OUTPUT);
    digitalWrite(_pin, LOW);
}

void Buzzer::beep(unsigned int frequency, unsigned long durationMs) {
    tone(_pin, frequency, durationMs);
    delay(durationMs);
    noTone(_pin);
}

void Buzzer::stop() {
    noTone(_pin);
    digitalWrite(_pin, LOW);
}

void Buzzer::playBoot() {
    tone(_pin, 1046, 80); delay(100);  // C6
    tone(_pin, 1318, 80); delay(100);  // E6
    tone(_pin, 1568, 120); delay(150); // G6
    noTone(_pin);
}

void Buzzer::playTap() {
    tone(_pin, 2000, 60);
    delay(70);
    noTone(_pin);
}

void Buzzer::playSuccess() {
    tone(_pin, 1760, 100); delay(120); // A6
    tone(_pin, 2637, 180); delay(200); // E7
    noTone(_pin);
}

void Buzzer::playDuplicate() {
    tone(_pin, 1200, 100); delay(150);
    tone(_pin, 1200, 100); delay(120);
    noTone(_pin);
}

void Buzzer::playError() {
    tone(_pin, 440, 400); delay(450);  // Low A4
    noTone(_pin);
}

void Buzzer::playOfflineBuffered() {
    tone(_pin, 880, 80); delay(120);
    tone(_pin, 880, 80); delay(100);
    noTone(_pin);
}

void Buzzer::playWiFiConnected() {
    tone(_pin, 880, 70); delay(90);
    tone(_pin, 1320, 120); delay(140);
    noTone(_pin);
}

void Buzzer::playWiFiLost() {
    tone(_pin, 1320, 100); delay(120);
    tone(_pin, 660, 200); delay(220);
    noTone(_pin);
}
