#ifndef SECRETS_EXAMPLE_H
#define SECRETS_EXAMPLE_H

// =============================================================================
// TapID ESP32 Secrets & Network Configuration Template
// Copy this file to secrets.h and customize with your local settings.
// =============================================================================

// Wi-Fi Credentials
#define WIFI_SSID       "YOUR_WIFI_SSID"
#define WIFI_PASSWORD   "YOUR_WIFI_PASSWORD"

// TapID Backend API Base URL (e.g. http://192.168.1.100:3000/api or https://api.tapid.edu/api)
#define API_BASE_URL    "http://192.168.1.100:3000/api"

// Hardware MAC Address Override
// Leave empty ("") to automatically use the ESP32 factory WiFi MAC address.
// Or specify a fixed MAC string matching the database devices table, e.g. "24:0A:C4:00:00:01"
#define DEVICE_MAC      "24:0A:C4:00:00:01"

// Optional Device Authentication Token / API Key (if backend requires it)
#define DEVICE_API_KEY  ""

#endif // SECRETS_EXAMPLE_H
