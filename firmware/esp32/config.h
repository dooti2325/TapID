#ifndef CONFIG_H
#define CONFIG_H

#include <stdint.h>

// =============================================================================
// TapID ESP32 Hardware Pin Definitions
// =============================================================================
// RC522 RFID SPI Interface
#define SS_PIN              21    // SDA / SS (Slave Select)
#define RST_PIN             22    // Reset pin
#define SPI_SCK_PIN         18    // SPI Clock
#define SPI_MISO_PIN        19    // SPI Master In Slave Out
#define SPI_MOSI_PIN        23    // SPI Master Out Slave In

// Indicators & Feedback
#define BUZZER_PIN          25    // Active/Passive Buzzer pin
#define LED_GREEN_PIN       26    // Green status LED (Success / Online)
#define LED_RED_PIN         27    // Red status LED (Error / Offline / Warning)

// =============================================================================
// System & Timing Parameters
// =============================================================================
#define SERIAL_BAUD_RATE        115200
#define CARD_DEBOUNCE_MS        2000    // Minimum ms before registering the same card again
#define OFFLINE_BUFFER_CAPACITY 50      // Maximum attendance taps buffered while offline
#define HTTP_TIMEOUT_MS         5000    // Timeout for HTTP requests to backend
#define WIFI_CONNECT_TIMEOUT_MS 15000   // Max wait time for initial connection
#define WIFI_RETRY_INTERVAL_MS  5000    // Interval between reconnection attempts
#define QUEUE_FLUSH_INTERVAL_MS 250     // Delay between batched flushes to avoid overloading API

// =============================================================================
// NTP / Time Synchronization Settings
// =============================================================================
#define NTP_SERVER_1            "pool.ntp.org"
#define NTP_SERVER_2            "time.nist.gov"
#define GMT_OFFSET_SEC          0       // UTC offset in seconds (can be overridden)
#define DAYLIGHT_OFFSET_SEC     0

// =============================================================================
// API Endpoints
// =============================================================================
#define ENDPOINT_ATTENDANCE_RECORD      "/attendance/record"
#define ENDPOINT_ATTENDANCE_BULK_RECORD "/attendance/bulk-record"

#endif // CONFIG_H
