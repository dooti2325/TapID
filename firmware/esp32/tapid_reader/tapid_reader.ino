/**
 * ============================================================================
 * TapID ESP32 RFID Attendance Terminal Firmware
 * Arduino IDE Sketch: tapid_reader.ino
 * ============================================================================
 * Hardware:
 *   - ESP32 NodeMCU / DevKit v1
 *   - RC522 RFID / NFC Reader (SPI)
 *   - Active/Passive Buzzer (GPIO 25)
 *   - Dual Status LEDs (Green: Pin 26, Red: Pin 27)
 *
 * Capabilities:
 *   - Automatic Wi-Fi connection with non-blocking auto-reconnect
 *   - NTP UTC time synchronization for accurate audit logs
 *   - Live attendance recording via TapID REST API (/api/attendance/record)
 *   - Offline ring-buffer queuing with automatic bulk sync (/api/attendance/bulk-record)
 *   - Card scan debounce/cooldown prevention
 *   - Multi-tone acoustic feedback & visual status signaling
 * ============================================================================
 */

#include <Arduino.h>
#include "config.h"
#include "secrets.h"
#include "attendance.h"

// Instantiate high-level attendance terminal controller
AttendanceController terminal;

void setup() {
    Serial.begin(SERIAL_BAUD_RATE);
    while (!Serial && millis() < 2000) {
        // Wait briefly for serial monitor if connected
    }

    terminal.begin();
}

void loop() {
    terminal.loop();
}