# TapID ESP32 Firmware

Production-grade, modular firmware for the **TapID** IoT Smart RFID Attendance Terminal powered by the **ESP32** microcontroller and the **MFRC522 (RC522)** 13.56 MHz RFID/NFC reader.

---

## Architecture Overview

The firmware is structured into decoupled, single-responsibility modules:

```text
firmware/
  platformio.ini              PlatformIO build configuration & library dependencies
  README.md                   Firmware specification and wiring manual
  esp32/
    main.ino                  ESP32 firmware main entry point
    config.h                  Hardware pin mappings, timeouts, and system constants
    secrets.example.h         Template for Wi-Fi credentials, MAC address, and API URL
    secrets.h                 Local network credentials (git-ignored in production)
    wifi_manager.h / .cpp     Wi-Fi connectivity, auto-reconnect, and NTP time sync
    rfid_reader.h / .cpp      MFRC522 SPI driver, UID hex parser, and card debounce
    buzzer.h / .cpp           Acoustic chime generator for user feedback
    led.h / .cpp              Dual-LED status indicator controller
    offline_queue.h / .cpp    FIFO ring buffer for storing offline attendance taps
    api_client.h / .cpp       HTTP client for single and bulk attendance REST endpoints
    attendance.h / .cpp       High-level attendance orchestrator and state coordinator
    tapid_reader/             Arduino IDE sketch directory with matching module files
```

---

## Hardware Bill of Materials (BOM)

| Component | Specification | Quantity | Notes |
| :--- | :--- | :--- | :--- |
| **ESP32 Development Board** | ESP32-WROOM-32 / DevKit v1 | 1 | 30 or 38-pin version |
| **RFID Reader Module** | MFRC522 (RC522) 13.56 MHz | 1 | SPI interface, 3.3V power |
| **RFID Cards / Keyfobs** | MIFARE Classic 1K (S50) | Any | 4-byte or 7-byte UID |
| **Active/Passive Buzzer** | 5V / 3.3V Buzzer | 1 | Connected to GPIO 25 |
| **Green LED** | 3mm or 5mm Green LED | 1 | Success / Online indicator (GPIO 26) |
| **Red LED** | 3mm or 5mm Red LED | 1 | Error / Offline indicator (GPIO 27) |
| **Resistors** | 220Ω or 330Ω (1/4W) | 2 | Current-limiting resistors for LEDs |
| **Jumper Wires** | Male-to-Female / Male-to-Male | ~15 | |
| **Breadboard or PCB** | Half/Full Breadboard or custom PCB | 1 | |

---

## Wiring & Pinout Reference

> [!CAUTION]
> **VCC of the RC522 module MUST be connected to 3.3V.** Connecting RC522 to 5V will permanently damage the MFRC522 RFID reader chip.

### MFRC522 to ESP32 Pin Connections

| RC522 Pin | ESP32 GPIO | Description |
| :--- | :--- | :--- |
| **VCC** | **3V3** | 3.3V Power Source (Do NOT use 5V) |
| **RST** | **GPIO 22** | Reader Reset |
| **GND** | **GND** | Common Ground |
| **MISO** | **GPIO 19** | SPI Master In / Slave Out |
| **MOSI** | **GPIO 23** | SPI Master Out / Slave In |
| **SCK** | **GPIO 18** | SPI Clock |
| **SDA / SS** | **GPIO 21** | SPI Slave Select |
| **IRQ** | *Unconnected* | Not required |

### Indicator Pin Connections

| Component | Pin | ESP32 GPIO | Notes |
| :--- | :--- | :--- | :--- |
| **Green LED** | Anode (+) | **GPIO 26** | Through 220Ω resistor to GPIO; Cathode to GND |
| **Red LED** | Anode (+) | **GPIO 27** | Through 220Ω resistor to GPIO; Cathode to GND |
| **Buzzer** | Positive (+) | **GPIO 25** | Negative to GND |

---

## Acoustic & Visual Feedback Matrix

| System Event | Green LED | Red LED | Buzzer Tone | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Device Boot** | Alternating | Alternating | C6-E6-G6 Chime (1046Hz, 1318Hz, 1568Hz) | System booted and peripherals initialized |
| **Wi-Fi Connected** | Solid ON | OFF | 880Hz -> 1320Hz ascending chirp | Connected to local network, NTP synced |
| **Card Tap Detected** | - | - | 2000Hz (60ms) chirp | Card entered RF field and UID was read |
| **Attendance Recorded** | Flash (400ms) | OFF | A6-E7 Success Chime (1760Hz, 2637Hz) | Server confirmed attendance (`200 OK`) |
| **Duplicate Tap** | Flash (2x) | Flash (2x) | Double Warning Tone (1200Hz, 1200Hz) | Attendance already recorded for session (`409`) |
| **No Active Session** | OFF | Flash (600ms) | Low Error Tone (440Hz, 400ms) | Classroom has no active session (`400`) |
| **Card/Device Invalid** | OFF | Flash (600ms) | Low Error Tone (440Hz, 400ms) | Card unknown or device revoked (`403/404`) |
| **Offline Tap Buffered** | OFF | Double Flash | Dual Chirp (880Hz, 880Hz) | Network offline; tap saved in queue buffer |
| **Bulk Flush Complete** | Solid ON | OFF | High Beep (2400Hz, 80ms) | Buffered taps synced to server |

---

## Configuration

1. Copy `esp32/secrets.example.h` to `esp32/secrets.h`:
   ```c
   // Wi-Fi Credentials
   #define WIFI_SSID       "YOUR_WIFI_SSID"
   #define WIFI_PASSWORD   "YOUR_WIFI_PASSWORD"

   // TapID Backend API Base URL
   #define API_BASE_URL    "http://192.168.1.100:3000/api"

   // Hardware MAC Address Override (leave empty to use chip MAC)
   #define DEVICE_MAC      "24:0A:C4:00:00:01"
   ```

2. Review `esp32/config.h` if custom GPIO pins or timeouts are required.

---

## How to Flash

### Method A: Arduino IDE

1. Open Arduino IDE (v2 recommended).
2. Install **ESP32 Board Support**:
   - Go to **File > Preferences > Additional Boards Manager URLs**.
   - Add: `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
   - Go to **Tools > Board > Boards Manager**, search for `esp32`, and install **esp32 by Espressif Systems**.
3. Install required libraries via **Sketch > Include Library > Manage Libraries**:
   - `MFRC522` by GithubCommunity (v1.4.11 or newer)
   - `ArduinoJson` by Benoit Blanchon (v7.0.4 or newer)
4. Open `firmware/esp32/tapid_reader/tapid_reader.ino` (or `firmware/esp32/main.ino`).
5. Select **Board**: `DOIT ESP32 DEVKIT V1` (or your ESP32 model).
6. Select the correct COM port.
7. Click **Upload**.
8. Open the Serial Monitor at **115200 baud** to view real-time diagnostics.

### Method B: PlatformIO (VS Code)

1. Open the `firmware/` folder in Visual Studio Code with the **PlatformIO IDE** extension installed.
2. PlatformIO will automatically fetch the ESP32 toolchain and library dependencies (`MFRC522`, `ArduinoJson`) specified in `platformio.ini`.
3. Connect your ESP32 via USB.
4. Click the PlatformIO **Build** (checkmark) and **Upload** (arrow) icons in the status bar.
5. Launch the Serial Monitor (`pio device monitor -b 115200`).

---

## Backend API Integration

The firmware communicates directly with the TapID Express backend:

### 1. Single Tap (`POST /api/attendance/record`)
```json
{
  "rfid_uid": "A1B2C3D4",
  "mac_address": "24:0A:C4:00:00:01"
}
```

### 2. Bulk Flush (`POST /api/attendance/bulk-record`)
```json
{
  "mac_address": "24:0A:C4:00:00:01",
  "records": [
    { "rfid_uid": "A1B2C3D4", "timestamp": "2026-09-08T10:00:00Z" },
    { "rfid_uid": "E5F6G7H8", "timestamp": "2026-09-08T10:00:05Z" }
  ]
}
```

---

## Unit Testing

The offline queue, FIFO ring buffer, and JSON serialization logic are validated with an automated C++ unit test:

```bash
g++ -std=c++11 -I firmware/esp32 tests/firmware/test_offline_queue.cpp firmware/esp32/offline_queue.cpp -o tests/firmware/test_offline_queue.exe
./tests/firmware/test_offline_queue.exe
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

## Troubleshooting

1. **`WARNING: Communication with MFRC522 failed. Check SPI wiring.`**
   - Verify that VCC is connected to **3.3V** (not 5V).
   - Ensure MOSI (GPIO 23), MISO (GPIO 19), SCK (GPIO 18), and SDA/SS (GPIO 21) are firmly seated.
   - Verify ground is shared between ESP32 and RC522.

2. **`Device not registered` or `Device revoked` (`403/404`)**
   - Check the MAC address printed in the Serial Monitor.
   - Confirm that this MAC address exists in the `devices` table with status `'online'` or `'offline'`.

3. **`No active session in this classroom` (`400`)**
   - An attendance session must be started from the faculty web portal before students can tap their cards.
