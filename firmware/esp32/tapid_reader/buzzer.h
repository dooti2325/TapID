#ifndef BUZZER_H
#define BUZZER_H

#include <Arduino.h>
#include "config.h"

class Buzzer {
public:
    explicit Buzzer(uint8_t pin = PIN_BUZZER);
    void init();

    // Specific acoustic feedback signals
    void playBoot();
    void playTap();
    void playWiFiConnected();
    void playWiFiLost();
    void playSessionStarted();           // Faculty started attendance session!
    void playSessionEnded();             // Attendance session ended/timed out
    void playAttendanceSuccess();        // Valid attendance marked
    void playAttendanceDuplicate();      // Duplicate card tap
    void playAttendanceWrongSection();   // Student from another section
    void playAttendanceError();          // Unknown / unassigned card
    void playProxyWarning();             // Special urgent proxy alert warning pattern!
    void playOfflineBuffered();          // Tap saved offline in local queue

    // Generic beep generator
    void beep(unsigned int frequency, unsigned long durationMs);
    void stop();

private:
    uint8_t _pin;
};

#endif // BUZZER_H
