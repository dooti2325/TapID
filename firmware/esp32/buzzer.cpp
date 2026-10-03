#include "buzzer.h"

Buzzer::Buzzer(uint8_t pin) : _pin(pin) {}

void Buzzer::init() {
    pinMode(_pin, OUTPUT);
    digitalWrite(_pin, LOW);
}

void Buzzer::beep(unsigned int frequency, unsigned long durationMs) {
    if (frequency < 1000) frequency = 2600;
    tone(_pin, frequency);
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
    tone(_pin, 2093); delay(90); noTone(_pin); delay(25);
    tone(_pin, 2637); delay(90); noTone(_pin); delay(25);
    tone(_pin, 3136); delay(140); noTone(_pin);
    digitalWrite(_pin, LOW);
}

// Tap Detected: Crisp, high-frequency click
void Buzzer::playTap() {
    tone(_pin, 2800); delay(45); noTone(_pin);
    digitalWrite(_pin, LOW);
}

// Wi-Fi Connected: Loud ascending high fanfare
void Buzzer::playWiFiConnected() {
    tone(_pin, 2400); delay(100); noTone(_pin); delay(25);
    tone(_pin, 3200); delay(180); noTone(_pin);
    digitalWrite(_pin, LOW);
}

// Wi-Fi Lost: Loud falling high alarm tone
void Buzzer::playWiFiLost() {
    tone(_pin, 3000); delay(120); noTone(_pin); delay(25);
    tone(_pin, 2200); delay(220); noTone(_pin);
    digitalWrite(_pin, LOW);
}

// Lecture Started by Faculty: High melodic chime that rings through the room
void Buzzer::playSessionStarted() {
    tone(_pin, 2093); delay(100); noTone(_pin); delay(25);
    tone(_pin, 2637); delay(100); noTone(_pin); delay(25);
    tone(_pin, 3520); delay(220); noTone(_pin);
    digitalWrite(_pin, LOW);
}

// Lecture Concluded / Ended
void Buzzer::playSessionEnded() {
    tone(_pin, 2794); delay(120); noTone(_pin); delay(25);
    tone(_pin, 2093); delay(240); noTone(_pin);
    digitalWrite(_pin, LOW);
}

// Valid Attendance Marked: High, joyful, loud success beep (E7 - A7)
void Buzzer::playAttendanceSuccess() {
    tone(_pin, 2637); delay(110); noTone(_pin); delay(25);
    tone(_pin, 3520); delay(200); noTone(_pin);
    digitalWrite(_pin, LOW);
}

// Duplicate Card Tap: Loud high double-click
void Buzzer::playAttendanceDuplicate() {
    tone(_pin, 2500); delay(90); noTone(_pin); delay(40);
    tone(_pin, 2500); delay(90); noTone(_pin);
    digitalWrite(_pin, LOW);
}

// Wrong Section Student: High distinct double warning tone
void Buzzer::playAttendanceWrongSection() {
    tone(_pin, 2400); delay(130); noTone(_pin); delay(40);
    tone(_pin, 2000); delay(250); noTone(_pin);
    digitalWrite(_pin, LOW);
}

// Unknown Card / Unregistered Error: Piercing high rejection buzz
void Buzzer::playAttendanceError() {
    tone(_pin, 2400); delay(150); noTone(_pin); delay(30);
    tone(_pin, 2100); delay(260); noTone(_pin);
    digitalWrite(_pin, LOW);
}

// Proxy Detected: Maximum loudness urgent alternating siren (3200Hz <-> 2400Hz)
void Buzzer::playProxyWarning() {
    for (int i = 0; i < 4; i++) {
        tone(_pin, 3200); delay(75); noTone(_pin); delay(15);
        tone(_pin, 2400); delay(75); noTone(_pin); delay(15);
    }
    tone(_pin, 3200); delay(220); noTone(_pin);
    digitalWrite(_pin, LOW);
}

// Offline Buffered Tap: High double blip
void Buzzer::playOfflineBuffered() {
    tone(_pin, 2700); delay(90); noTone(_pin); delay(30);
    tone(_pin, 2700); delay(90); noTone(_pin);
    digitalWrite(_pin, LOW);
}
