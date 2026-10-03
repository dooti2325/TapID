# TapID Enterprise ESP32 Firmware Guide

Production-grade, modular C++ firmware for the **TapID** IoT Smart RFID Attendance Terminal powered by the **ESP32** microcontroller and the **MFRC522 (RC522)** 13.56 MHz RFID/NFC reader.

---

## Quick Reference: Hardware & Pin Configuration

| Component | Pin Function | ESP32 GPIO | Description |
|:---|:---|:---|:---|
| **RC522 SDA / SS** | SPI Chip Select | **GPIO 5** *(or 21)* | MFRC522 Slave Select |
| **RC522 RST** | Reset | **GPIO 22** | Hardware reset |
| **RC522 SCK** | SPI Clock | **GPIO 18** | SPI Clock |
| **RC522 MISO** | SPI MISO | **GPIO 19** | Master In, Slave Out |
| **RC522 MOSI** | SPI MOSI | **GPIO 23** | Master Out, Slave In |
| **RC522 3.3V** | Power (VCC) | **3V3 Rail** | **NEVER CONNECT TO 5V!** |
| **Wi-Fi Green LED** | Indicator | **GPIO 13** | **Solid ON when Wi-Fi is connected** |
| **Wi-Fi Red LED** | Indicator | **GPIO 14** | **Solid ON when disconnected / blinking when connecting** |
| **Attendance Green LED** | Indicator | **GPIO 26** | **Turns ON for 3 seconds on valid attendance marked** |
| **Attendance Red LED** | Indicator | **GPIO 27** | **Turns ON for 3 seconds on invalid/wrong section; Strobes on Proxy** |
| **Buzzer** | Acoustic Tone | **GPIO 25** | Active or Passive Buzzer (melodies & warning siren) |
| **Config / Reset Button** | Control Input | **GPIO 4** *(or BOOT 0)*| **Hold 3s**: Wi-Fi AP Setup Portal; **Hold 10s**: Factory Reset |

---

## Audio & Visual Indicator State Matrix

| System Event | Wi-Fi LEDs | Attendance LEDs | Buzzer Acoustic Pattern | Behavior / Logic |
|:---|:---|:---|:---|:---|
| **Device Power-Up** | Wave test | Wave test | **C6-E6-G6** Chime (1046Hz, 1318Hz, 1568Hz) | Self-test of all peripherals and SPI bus. |
| **Wi-Fi Connected** | **Green ON**, Red OFF | Ready (OFF) | **880Hz → 1320Hz** Rising chime | Acquired IP, synced NTP UTC clock, online in DB. |
| **Wi-Fi Disconnected** | Green OFF, **Red ON** | Unaffected | **1320Hz → 660Hz** Falling tone | Automatically switches to offline buffering queue. |
| **Attendance Started by Faculty**| Current Wi-Fi state | Ready (OFF) | **C6-E6-A6 Melodic Chime** (1046Hz, 1318Hz, 1760Hz)| Terminal becomes **ACTIVE** for student scans! |
| **Attendance Ended / Timed Out** | Current Wi-Fi state | Ready (OFF) | **E6 → A5** Low notification | Terminal returns to **STANDBY** mode. |
| **Correct Section Student** | Current Wi-Fi state | **Green ON for 3 seconds** | **A6-E7** Success Beep (1760Hz, 2637Hz) | Attendance marked `PRESENT` in database. |
| **Wrong Section Student** | Current Wi-Fi state | **Red ON for 3 seconds** | **550Hz → 400Hz** Double low tone | Rejected & logged as `ATTENDANCE_WRONG_SECTION`. |
| **Duplicate Card Tap** | Current Wi-Fi state | **Red ON for 3 seconds** | **1200Hz - 1200Hz** Double click tone | Not counted twice; logged as `ATTENDANCE_DUPLICATE`. |
| **Unknown / Unassigned Card** | Current Wi-Fi state | **Red ON for 3 seconds** | **440Hz** Low rejection tone | Card not registered; logged in security audit log. |
| **Proxy Detected (< 3s)** | Current Wi-Fi state | **Red FAST STROBE for 3s**| **Urgent Siren Warble** (3x 2800Hz / 1600Hz) | Two different IDs scanned within 3 seconds! |
| **Offline Buffering Tap** | Green OFF, Red ON | Both ON for 3s | **880Hz - 880Hz** Double blip | Stored in local circular buffer, auto-synced when online. |
| **Wi-Fi Setup Portal Active** | **Alternating Blink** | OFF | Ascending setup beep | SoftAP `TapID-Setup-XXXX` active at `192.168.4.1`. |

> [!NOTE]
> **3-Second Auto-Off**: Both the Attendance Green and Red LEDs automatically turn off after exactly 3 seconds (`3000 ms`), indicating that the terminal is clear and ready for the next student to tap.

---

## Smart Features

### 1. Wi-Fi Configuration Mode (SoftAP & Captive Portal)
- To connect the terminal to any Wi-Fi network without modifying code:
  1. Press and hold the **Config Button** (GPIO 4 or built-in BOOT button GPIO 0) for **3 seconds**.
  2. The terminal creates a Wi-Fi hotspot named `TapID-Setup-XXXX` (Password: `tapid1234`).
  3. Connect using your phone or laptop and open `http://192.168.4.1`.
  4. Enter your local Wi-Fi SSID, Password, TapID Server URL, and Device Key.
  5. Click **Save & Connect**. The ESP32 saves credentials to non-volatile flash memory (NVS) and automatically reboots into normal mode.
- **Factory Reset**: Hold the button for **10 seconds** to wipe saved NVS settings and restore defaults from `secrets.h`.

### 2. Anti-Proxy Detection Engine
- Students attempting to scan multiple cards back-to-back will trigger the Anti-Proxy detection engine:
  - If a different card UID is tapped within **3 seconds** of a previous card, the firmware flags the transaction as a proxy attempt.
  - The buzzer emits an urgent alternating alarm siren and the red attendance LED rapidly strobes.
  - An `ATTENDANCE_PROXY_DETECTED` security incident is automatically logged to the TapID audit log with student identity, card UIDs, and timestamps.

### 3. Automatic Lecture & Section Validation
- Terminals remain in **Standby** mode until faculty starts an attendance session from the TapID web dashboard.
- Periodic **heartbeat queries** detect when a lecture starts, playing the faculty start chime.
- The server cross-references the student's enrolled section against the scheduled lecture timetable:
  - If a student from another section attempts to scan, attendance is denied with a wrong-section error tone and red indicator.

### 4. Fail-Safe Offline Buffering & Automatic Bulk Sync
- If campus Wi-Fi or internet connection drops:
  - Scans are recorded with synchronized NTP UTC timestamps into a circular FIFO queue (up to 50 records).
  - When connection is restored, the terminal automatically transmits bulk sync batches via `POST /api/attendance/bulk-record` without losing attendance data.

---

## Flashing Instructions

### Method A: Arduino IDE
1. Open [firmware/esp32/tapid_reader/tapid_reader.ino](file:///d:/TapID/firmware/esp32/tapid_reader/tapid_reader.ino).
2. Install required libraries via Library Manager:
   - `MFRC522` by GithubCommunity (v1.4.11+)
   - `ArduinoJson` by Benoit Blanchon (v7.0.4+)
3. Select board: `DOIT ESP32 DEVKIT V1` and your USB COM port.
4. Click **Upload** and monitor at **115200 baud**.

### Method B: PlatformIO (VS Code)
1. Open the project root or `firmware/` directory in VS Code with PlatformIO installed.
2. Build and flash:
   ```bash
   pio run -t upload
   ```
3. Open serial monitor:
   ```bash
   pio device monitor -b 115200
   ```
