#include "led.h"

LedIndicator::LedIndicator(uint8_t greenPin, uint8_t redPin)
    : _greenPin(greenPin), _redPin(redPin), _lastToggleTime(0), _toggleState(false) {}

void LedIndicator::init() {
    pinMode(_greenPin, OUTPUT);
    pinMode(_redPin, OUTPUT);
    allOff();
}

void LedIndicator::setGreen(bool on) {
    digitalWrite(_greenPin, on ? HIGH : LOW);
}

void LedIndicator::setRed(bool on) {
    digitalWrite(_redPin, on ? HIGH : LOW);
}

void LedIndicator::allOff() {
    digitalWrite(_greenPin, LOW);
    digitalWrite(_redPin, LOW);
}

void LedIndicator::flashGreen(unsigned long durationMs) {
    digitalWrite(_greenPin, HIGH);
    delay(durationMs);
    digitalWrite(_greenPin, LOW);
}

void LedIndicator::flashRed(unsigned long durationMs) {
    digitalWrite(_redPin, HIGH);
    delay(durationMs);
    digitalWrite(_redPin, LOW);
}

void LedIndicator::flashBoth(unsigned long durationMs) {
    digitalWrite(_greenPin, HIGH);
    digitalWrite(_redPin, HIGH);
    delay(durationMs);
    digitalWrite(_greenPin, LOW);
    digitalWrite(_redPin, LOW);
}

void LedIndicator::showBoot() {
    for (int i = 0; i < 3; i++) {
        digitalWrite(_greenPin, HIGH);
        digitalWrite(_redPin, LOW);
        delay(80);
        digitalWrite(_greenPin, LOW);
        digitalWrite(_redPin, HIGH);
        delay(80);
    }
    allOff();
}

void LedIndicator::showReady() {
    digitalWrite(_greenPin, HIGH);
    digitalWrite(_redPin, LOW);
}

void LedIndicator::showSuccess() {
    allOff();
    digitalWrite(_greenPin, HIGH);
    delay(400);
    digitalWrite(_greenPin, LOW);
}

void LedIndicator::showDuplicate() {
    allOff();
    for (int i = 0; i < 2; i++) {
        digitalWrite(_greenPin, HIGH);
        digitalWrite(_redPin, HIGH);
        delay(120);
        allOff();
        delay(100);
    }
}

void LedIndicator::showError() {
    allOff();
    digitalWrite(_redPin, HIGH);
    delay(600);
    digitalWrite(_redPin, LOW);
}

void LedIndicator::showOfflineBuffered() {
    allOff();
    for (int i = 0; i < 2; i++) {
        digitalWrite(_redPin, HIGH);
        delay(100);
        digitalWrite(_redPin, LOW);
        delay(100);
    }
}

void LedIndicator::updateConnecting(unsigned long currentMillis) {
    if (currentMillis - _lastToggleTime >= 250) {
        _lastToggleTime = currentMillis;
        _toggleState = !_toggleState;
        digitalWrite(_greenPin, _toggleState ? HIGH : LOW);
        digitalWrite(_redPin, _toggleState ? LOW : HIGH);
    }
}
