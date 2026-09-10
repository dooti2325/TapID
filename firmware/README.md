# TapID ESP32 Firmware Guide

Production-grade, modular C++ firmware for the **TapID** IoT Smart RFID Attendance Terminal powered by the **ESP32** microcontroller and the **MFRC522 (RC522)** 13.56 MHz RFID/NFC reader.

---

## Quick Reference: What, Where, When, and How

| Question | Detail |
|:---|:---|
| **WHAT is this?** | Modular ESP32 firmware that reads MIFARE RFID cards, communicates with the TapID REST API via Wi-Fi, provides acoustic/visual feedback, and buffers taps offline if the network drops. |
| **WHERE is it located?** | Source code in `firmware/esp32/` (PlatformIO) and `firmware/esp32/tapid_reader/` (Arduino IDE). Configuration in `config.h` and credentials in `secrets.h`. |
| **WHEN does it execute?** | Operates in an infinite non-blocking event loop upon device power-up: continuously checks RF fields for cards, monitors Wi-Fi connection, flushes offline queues when network returns, and syncs time via NTP. |
| **HOW do I use it?** | Wire the hardware, configure `secrets.h` with your Wi-Fi SSID and backend URL, flash using **Arduino IDE** or **PlatformIO**, and monitor output at **115200 baud**. |

---

## 1. What: System Overview & Hardware Specifications

### Bill of Materials (BOM)

| Component | Specification | Quantity | Notes |
|:---|:---|:---|:---|
| **ESP32 Development Board** | ESP32-WROOM-32 / DevKit v1 | 1 | 30 or 38-pin version with Wi-Fi & Bluetooth |
| **RFID Reader Module** | MFRC522 (RC522) 13.56 MHz | 1 | SPI interface, **must be powered with 3.3V** |
| **RFID Cards / Keyfobs** | MIFARE Classic 1K (S50) | Any | Supports 4-byte or 7-byte UID cards |
| **Acoustic Buzzer** | Active or Passive 3.3V/5V Buzzer | 1 | Connected to GPIO 25 |
| **Green Status LED** | 3mm or 5mm Green LED | 1 | Success / Online indicator (GPIO 26) |
| **Red Status LED** | 3mm or 5mm Red LED | 1 | Error / Offline indicator (GPIO 27) |
| **Current Resistors** | 220Ω or 330Ω (1/4W) | 2 | Current-limiting resistors for LEDs |
| **Jumper Wires & Breadboard** | Male-to-Female / Male-to-Male | ~15 | Half or full breadboard for prototyping |

---

## 2. Where: Wiring & Pinout Reference

> [!CAUTION]
> **VCC of the RC522 RFID reader MUST be connected to 3.3V.** Connecting RC522 to 5V will permanently burn out the MFRC522 chip!

### MFRC522 to ESP32 Pin Connections (SPI)

| RC522 Pin | ESP32 GPIO | Pin Function | Description |
|:---|:---|:---|:---|
| **VCC** | **3V3** | Power | 3.3V Power Rail (DO NOT USE 5V) |
| **RST** | **GPIO 22** | Reset | Hard reset pin for reader chip |
| **GND** | **GND** | Ground | Common system ground |
| **MISO** | **GPIO 19** | SPI MISO | Master In, Slave Out |
| **MOSI** | **GPIO 23** | SPI MOSI | Master Out, Slave In |
| **SCK** | **GPIO 18** | SPI Clock | Serial SPI Clock line |
| **SDA / SS**| **GPIO 21** | SPI Chip Select | Slave Select (CS) |
| **IRQ** | *Unconnected* | Interrupt | Not required (firmware uses polled SPI) |

### Indicator & Acoustic Feedback Wiring

| Component | Pin / Terminal | ESP32 GPIO | Wiring Notes |
|:---|:---|:---|:---|
| **Green LED** | Anode (+) | **GPIO 26** | Connect through 220Ω resistor; Cathode (-) to GND |
| **Red LED** | Anode (+) | **GPIO 27** | Connect through 220Ω resistor; Cathode (-) to GND |
| **Buzzer** | Positive (+) | **GPIO 25** | Positive leg to GPIO 25; Negative leg to GND |

---

## 3. When: State Machine & Acoustic Feedback Matrix

The terminal operates across defined states with immediate audio-visual feedback:

| When This Occurs | Green LED | Red LED | Buzzer Melody | System Action |
|:---|:---|:---|:---|:---|
| **Device Boots** | Alternating | Alternating | C6-E6-G6 Chime (1046Hz, 1318Hz, 1568Hz) | Hardware peripherals, SPI bus, and queue initialized. |
| **Wi-Fi Connected** | Solid ON | OFF | 880Hz → 1320Hz ascending chirp | Terminal acquired IP and synchronized NTP time. |
| **Card Tap Detected** | - | - | 2000Hz (60ms) tick | Card entered RF field; UID hex parsed. |
| **Attendance Success** | Flash (400ms) | OFF | A6-E7 Success Chime (1760Hz, 2637Hz) | Server confirmed attendance (`200 OK`). |
| **Duplicate Card Tap** | Flash (2x) | Flash (2x) | Double Warning Tone (1200Hz, 1200Hz) | Attendance already recorded for session (`409 Conflict`). |
| **No Active Session** | OFF | Flash (600ms) | Low Error Tone (440Hz, 400ms) | Classroom has no active lecture running (`400 Bad Request`). |
| **Invalid Card / Device** | OFF | Flash (600ms) | Low Error Tone (440Hz, 400ms) | Card unknown or device revoked (`403/404`). |
| **Wi-Fi Dropped / Offline** | OFF | Double Flash | Dual Chirp (880Hz, 880Hz) | Scan stored in offline FIFO ring buffer with timestamp. |
| **Bulk Flush Complete** | Solid ON | OFF | High Beep (2400Hz, 80ms) | All buffered scans successfully transmitted to server. |

---

## 4. How: Step-by-Step Configuration & Flashing

### Step 1: Configure Credentials

Open `firmware/esp32/secrets.h` (or copy from `secrets.example.h`):

```c
#ifndef SECRETS_H
#define SECRETS_H

// Wi-Fi Credentials
#define WIFI_SSID       "YOUR_WIFI_NAME"
#define WIFI_PASSWORD   "YOUR_WIFI_PASSWORD"

// TapID Backend API Base URL (Use your computer's local IP on the Wi-Fi network)
#define API_BASE_URL    "http://192.168.1.100:3000/api"

// Hardware MAC Address Override
// Set to "24:0A:C4:00:00:01" to match Classroom 101 seed terminal,
// or leave empty "" to use the ESP32's native factory MAC.
#define DEVICE_MAC      "24:0A:C4:00:00:01"

// Optional Device API Key
#define DEVICE_API_KEY  ""

#endif // SECRETS_H
```

---

### Step 2: Flash the Firmware

#### Method A: Using Arduino IDE (Beginner Friendly)

1. **Install ESP32 Core**:
   - In Arduino IDE, navigate to **File > Preferences**.
   - Paste into *Additional Boards Manager URLs*:  
     `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
   - Go to **Tools > Board > Boards Manager**, search for `esp32`, and install **esp32 by Espressif Systems**.
2. **Install Libraries**:
   - Go to **Sketch > Include Library > Manage Libraries**.
   - Search and install:
     - `MFRC522` by GithubCommunity (v1.4.11 or newer)
     - `ArduinoJson` by Benoit Blanchon (v7.0.4 or newer)
3. **Open the Sketch**:
   - Open [tapid_reader.ino](file:///d:/TapID/firmware/esp32/tapid_reader/tapid_reader.ino).
4. **Select Board & Port**:
   - Board: `DOIT ESP32 DEVKIT V1`
   - Port: Select your ESP32 COM port (e.g. `COM3` on Windows).
5. **Upload & Monitor**:
   - Click **Upload** (arrow icon).
   - Open **Serial Monitor** at **115200 baud** to view real-time diagnostics.

#### Method B: Using PlatformIO (VS Code)

1. Open Visual Studio Code and ensure the **PlatformIO IDE** extension is installed.
2. Open the `firmware/` directory. PlatformIO automatically downloads toolchains and libraries specified in `platformio.ini`.
3. Connect your ESP32 via USB.
4. Click the PlatformIO **Upload** button in the bottom status bar (or run `pio run -t upload`).
5. Open the Serial Monitor with `pio device monitor -b 115200`.

---

### Step 3: Run the Firmware C++ Unit Tests

The offline queue, FIFO ring buffer, capacity overflow handling, and JSON serialization are verified with automated unit tests:

```bash
# Run automated test from project root
npm run test:firmware
```

Output:
```text
Running TapID Firmware Offline Queue Unit Tests...
[PASS] test_initial_state
[PASS] test_fifo_ordering
[PASS] test_capacity_and_overflow
[PASS] test_peek_and_clear
[PASS] test_json_serialization
All firmware unit tests PASSED successfully!
```

---

## 5. Backend REST Contract

The terminal interacts with two endpoints on the TapID API:

### Live Scan (`POST /api/attendance/record`)
```json
{
  "rfid_uid": "A1B2C3D4",
  "mac_address": "24:0A:C4:00:00:01"
}
```
**Responses**:
- `200 OK`: `{"message":"Attendance recorded successfully","student":{"name":"John Doe"}}`
- `409 Conflict`: `{"message":"Attendance already recorded for this session"}`
- `400 Bad Request`: `{"message":"No active session found for this classroom"}`
- `403/404`: `{"message":"Device revoked or card not registered"}`

### Bulk Reconnect Flush (`POST /api/attendance/bulk-record`)
```json
{
  "mac_address": "24:0A:C4:00:00:01",
  "records": [
    { "rfid_uid": "A1B2C3D4", "timestamp": "2026-09-08T10:15:00Z" },
    { "rfid_uid": "E5F6G7H8", "timestamp": "2026-09-08T10:15:04Z" }
  ]
}
```

---

## 6. Troubleshooting Guide

| Issue | Root Cause | Solution |
|:---|:---|:---|
| Serial prints: `WARNING: Communication with MFRC522 failed` | SPI wiring error or incorrect voltage | Verify RC522 VCC is in **3.3V** (not 5V). Check SCK (GPIO 18), MOSI (GPIO 23), MISO (GPIO 19), SS/SDA (GPIO 21). |
| `WiFi connection timeout. Entering offline mode.` | Wrong credentials or 5GHz network | ESP32 only supports **2.4 GHz Wi-Fi**. Check SSID and password in `secrets.h`. |
| Server returns `400 No active session` | Lecture has not been started | A faculty member must log into the web portal and click **Start Session** for the classroom. |
| Server returns `404 Card not registered` | Card UID not mapped in database | An administrator must enroll the student and assign the card UID in the web portal under **Students**. |
| Server returns `403 Device revoked` | Device marked revoked in database | Check terminal MAC address and set status to active/online in **Admin > Devices**. |
