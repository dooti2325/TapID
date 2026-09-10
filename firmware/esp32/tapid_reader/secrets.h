#ifndef SECRETS_H
#define SECRETS_H

// =============================================================================
// TapID ESP32 Secrets & Network Configuration
// Matches seed data device '24:0A:C4:00:00:01' in Classroom 101
// =============================================================================

// Wi-Fi Credentials
#define WIFI_SSID       "Dooti_S23"
#define WIFI_PASSWORD   "123456789"

// TapID Backend API Base URL
#define API_BASE_URL    "http://192.168.1.100:3000/api"

// Hardware MAC Address Override
// Set to match demo device in database/seed.sql or leave empty "" to use chip MAC
#define DEVICE_MAC      "24:0A:C4:00:00:01"

// Optional Device Authentication Token
#define DEVICE_API_KEY  ""

#endif // SECRETS_H
