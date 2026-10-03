#include "buzzer.h"

Buzzer::Buzzer(uint8_t pin) : _pin(pin) {}

void Buzzer::init() {
    pinMode(_pin, OUTPUT);
    digitalWrite(_pin, LOW);
}

void Buzzer::beep(unsigned int frequency, unsigned long durationMs) {
    // Ensure all general beeps are at high, loud resonant frequency (minimum 2400Hz)
    if (frequency < 2000) frequency = 2600;
    tone(_pin, frequency, durationMs);
    delay(durationMs);
    noTone(_pin);
    digitalWrite(_pin, LOW);
}

void Buzzer::stop() {
    noTone(_pin);
    digitalWrite(_pin, LOW);
}

// Power-Up Chime: High resonant triad (C7 - E7 - G7)
void Buzzer::playBoot() {
    tone(_pin, 2093, 90); delay(110);  // C7
    tone(_pin, 2637, 90); delay(110);  // E7
    tone(_pin, 3136, 140); delay(160); // G7
    noTone(_pin);
    digitalWrite(_pin, LOW);
}

// Tap Detected: Crisp, high-frequency click
void Buzzer::playTap() {
    tone(_pin, 2800, 45);
    delay(50);
    noTone(_pin);
    digitalWrite(_pin, LOW);
}

// Wi-Fi Connected: Loud ascending high fanfare
void Buzzer::playWiFiConnected() {
    tone(_pin, 2400, 100); delay(110); // High D7
    tone(_pin, 3200, 180); delay(200); // Piercing G7
    noTone(_pin);
    digitalWrite(_pin, LOW);
}

// Wi-Fi Lost: Loud falling high alarm tone
void Buzzer::playWiFiLost() {
    tone(_pin, 3000, 120); delay(130);
    tone(_pin, 2200, 220); delay(240);
    noTone(_pin);
    digitalWrite(_pin, LOW);
}

// Lecture Started by Faculty: High melodic chime that rings through the room
void Buzzer::playSessionStarted() {
    tone(_pin, 2093, 100); delay(115); // C7
    tone(_pin, 2637, 100); delay(115); // E7
    tone(_pin, 3520, 220); delay(240); // A7
    noTone(_pin);
    digitalWrite(_pin, LOW);
}

// Lecture Concluded / Ended
void Buzzer::playSessionEnded() {
    tone(_pin, 2794, 120); delay(135); // F7
    tone(_pin, 2093, 240); delay(260); // C7
    noTone(_pin);
    digitalWrite(_pin, LOW);
}

// Valid Attendance Marked: High, joyful, loud success beep (E7 - A7)
void Buzzer::playAttendanceSuccess() {
    tone(_pin, 2637, 110); delay(120); // E7
    tone(_pin, 3520, 200); delay(220); // A7 (High, crisp, rewarding)
    noTone(_pin);
    digitalWrite(_pin, LOW);
}

// Duplicate Card Tap: Loud high double-click
void Buzzer::playAttendanceDuplicate() {
    tone(_pin, 2500, 90); delay(110);
    tone(_pin, 2500, 90); delay(110);
    noTone(_pin);
    digitalWrite(_pin, LOW);
}

// Wrong Section Student: High distinct double warning tone
void Buzzer::playAttendanceWrongSection() {
    tone(_pin, 2400, 130); delay(150);
    tone(_pin, 2000, 250); delay(270);
    noTone(_pin);
    digitalWrite(_pin, LOW);
}

// Unknown Card / Unregistered Error: Piercing high rejection buzz
void Buzzer::playAttendanceError() {
    tone(_pin, 2400, 150); delay(170);
    tone(_pin, 2100, 260); delay(280);
    noTone(_pin);
    digitalWrite(_pin, LOW);
}

// Proxy Detected: Maximum loudness urgent alternating siren (3200Hz <-> 2400Hz)
void Buzzer::playProxyWarning() {
    for (int i = 0; i < 4; i++) {
        tone(_pin, 3200, 75); delay(85);
        tone(_pin, 2400, 75); delay(85);
    }
    tone(_pin, 3200, 220); delay(240);
    noTone(_pin);
    digitalWrite(_pin, LOW);
}

// Offline Buffered Tap: High double blip
void Buzzer::playOfflineBuffered() {
    tone(_pin, 2700, 90); delay(110);
    tone(_pin, 2700, 90); delay(110);
    noTone(_pin);
    digitalWrite(_pin, LOW);
}
