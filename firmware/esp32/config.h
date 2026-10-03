#ifndef CONFIG_H
#define CONFIG_H

#include <stdint.h>

// =============================================================================
// TapID ESP32 Hardware Pin Definitions
// =============================================================================

// --- RC522 RFID SPI Interface ---
// Standard ESP32 VSPI Hardware Pins
#define SS_PIN                  5     // RFID SDA / SS (Slave Select) - Pin 5 (or 21)
#define RST_PIN                 22    // RFID Reset pin
#define SPI_SCK_PIN             18    // SPI Clock
#define SPI_MISO_PIN            19    // SPI Master In Slave Out
#define SPI_MOSI_PIN            23    // SPI Master Out Slave In

// --- Status LEDs (4 Dedicated Indicators) ---
#define PIN_LED_WIFI_GREEN      13    // Green LED 1: Wi-Fi Connected
#define PIN_LED_WIFI_RED        14    // Red LED 1: Wi-Fi Disconnected / Searching
#define PIN_LED_ATTEND_GREEN    26    // Green LED 2: Valid Attendance Marked (3s auto-off)
#define PIN_LED_ATTEND_RED      27    // Red LED 2: Invalid / Wrong Section / Proxy (3s auto-off)

// --- Acoustic Feedback ---
#define PIN_BUZZER              25    // Buzzer pin (Active / Passive tone)

// --- Inputs & Controls ---
#define PIN_CONFIG_BUTTON       4     // Pushbutton for AP Config Mode (3s hold) & Factory Reset (10s hold)
#define PIN_BOOT_BUTTON         0     // Built-in ESP32 BOOT button (also supported for AP setup)

// =============================================================================
// System & Timing Parameters
// =============================================================================
#define SERIAL_BAUD_RATE        115200

// LED & Attendance Feedback Timing
#define TAP_FEEDBACK_DURATION_MS 3000   // LED stays lit for exactly 3 seconds, then turns off (ready for next tap)
#define PROXY_DETECTION_WINDOW_MS 3000  // Two different card IDs tapped within 3s triggers Proxy Alert!
#define CARD_DEBOUNCE_MS        1500   // Cooldown before same card can be tapped again

// Server Polling & Heartbeat
#define HEARTBEAT_INTERVAL_MS   10000  // Heartbeat ping interval to server (reports status & checks active session)
#define HTTP_TIMEOUT_MS         5000   // Timeout for backend HTTP requests

// Wi-Fi & Offline Parameters
#define WIFI_CONNECT_TIMEOUT_MS 15000  // Max wait for initial Wi-Fi connection
#define WIFI_RETRY_INTERVAL_MS  5000   // Interval between reconnection attempts
#define OFFLINE_BUFFER_CAPACITY 50     // Maximum attendance records buffered in flash/RAM during outages
#define QUEUE_FLUSH_INTERVAL_MS 250    // Delay between bulk batch flushes

// Wi-Fi SoftAP Configuration Portal
#define AP_SSID_PREFIX          "TapID-Setup-"
#define AP_PASSWORD             "tapid1234"
#define AP_PORTAL_TIMEOUT_SEC   180    // 3 minutes before auto-exiting portal mode if inactive

// =============================================================================
// NTP / Time Synchronization Settings
// =============================================================================
#define NTP_SERVER_1            "pool.ntp.org"
#define NTP_SERVER_2            "time.google.com"
#define NTP_SERVER_3            "time.cloudflare.com"
#define GMT_OFFSET_SEC          19800  // UTC +5:30 (India Standard Time by default, configurable)
#define DAYLIGHT_OFFSET_SEC     0

// =============================================================================
// API Endpoints
// =============================================================================
#define ENDPOINT_ATTENDANCE_RECORD      "/attendance/record"
#define ENDPOINT_ATTENDANCE_BULK_RECORD "/attendance/bulk-record"
#define ENDPOINT_DEVICE_STATUS          "/devices/status"
#define ENDPOINT_DEVICE_HEARTBEAT       "/devices/heartbeat"

#endif // CONFIG_H
