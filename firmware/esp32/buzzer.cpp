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
    tone(_pin, 2400, 35);
    delay(40);
    noTone(_pin);
}

void Buzzer::playWiFiConnected() {
    tone(_pin, 880, 80); delay(90);    // A5
    tone(_pin, 1320, 140); delay(150);  // E6
    noTone(_pin);
}

void Buzzer::playWiFiLost() {
    tone(_pin, 1320, 100); delay(120);
    tone(_pin, 660, 200); delay(220);
    noTone(_pin);
}

// Chime when faculty starts attendance from the website
void Buzzer::playSessionStarted() {
    tone(_pin, 1046, 90); delay(110);  // C6
    tone(_pin, 1318, 90); delay(110);  // E6
    tone(_pin, 1760, 180); delay(200); // A6
    noTone(_pin);
}

void Buzzer::playSessionEnded() {
    tone(_pin, 1318, 100); delay(120);
    tone(_pin, 880, 200); delay(220);
    noTone(_pin);
}

// Valid attendance marked: Clear pleasant high-tone chime
void Buzzer::playAttendanceSuccess() {
    tone(_pin, 1760, 100); delay(110); // A6
    tone(_pin, 2637, 180); delay(200); // E7
    noTone(_pin);
}

// Duplicate card tap: Quick double-beep
void Buzzer::playAttendanceDuplicate() {
    tone(_pin, 1200, 90); delay(110);
    tone(_pin, 1200, 90); delay(110);
    noTone(_pin);
}

// Wrong section student: Double low-pitch warning
void Buzzer::playAttendanceWrongSection() {
    tone(_pin, 550, 140); delay(160);
    tone(_pin, 400, 220); delay(240);
    noTone(_pin);
}

// Unknown card / invalid error
void Buzzer::playAttendanceError() {
    tone(_pin, 440, 300); delay(320); // Low A4
    noTone(_pin);
}

// Special urgent proxy detection warning pattern (rapid alternating siren beeps)
void Buzzer::playProxyWarning() {
    for (int i = 0; i < 3; i++) {
        tone(_pin, 2800, 70); delay(80);
        tone(_pin, 1600, 70); delay(80);
    }
    tone(_pin, 2800, 150); delay(160);
    noTone(_pin);
}

void Buzzer::playOfflineBuffered() {
    tone(_pin, 880, 80); delay(100);
    tone(_pin, 880, 80); delay(100);
    noTone(_pin);
}
