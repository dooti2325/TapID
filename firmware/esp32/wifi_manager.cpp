#include "wifi_manager.h"

WiFiManager::WiFiManager()
    : _lastReconnectAttempt(0),
      _reconnectInterval(WIFI_RETRY_INTERVAL_MS),
      _wasConnected(false),
      _timeSynced(false) {}

void WiFiManager::begin() {
    WiFi.mode(WIFI_STA);

    // Determine effective MAC address
    String configuredMac = String(DEVICE_MAC);
    configuredMac.trim();
    if (configuredMac.length() > 0) {
        _effectiveMac = configuredMac;
    } else {
        _effectiveMac = WiFi.macAddress();
    }

    Serial.println("\n[WiFi] Initializing Wi-Fi connection...");
    Serial.printf("[WiFi] Target SSID: %s\n", WIFI_SSID);
    Serial.printf("[WiFi] Device MAC:  %s\n", _effectiveMac.c_str());

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    unsigned long start = millis();
    while (WiFi.status() != WL_CONNECTED && (millis() - start) < WIFI_CONNECT_TIMEOUT_MS) {
        delay(300);
        Serial.print(".");
    }

    if (WiFi.status() == WL_CONNECTED) {
        _wasConnected = true;
        Serial.println("\n[WiFi] Connected successfully!");
        Serial.printf("[WiFi] IP Address: %s\n", WiFi.localIP().toString().c_str());
        Serial.printf("[WiFi] Signal RSSI: %d dBm\n", WiFi.RSSI());
        initTimeSync();
    } else {
        Serial.println("\n[WiFi] Initial connection timed out. Will retry in background.");
        _wasConnected = false;
    }
}

void WiFiManager::loop() {
    bool connected = (WiFi.status() == WL_CONNECTED);

    if (connected && !_wasConnected) {
        Serial.println("\n[WiFi] Reconnected to network!");
        Serial.printf("[WiFi] IP Address: %s\n", WiFi.localIP().toString().c_str());
        _wasConnected = true;
        if (!_timeSynced) {
            initTimeSync();
        }
    } else if (!connected && _wasConnected) {
        Serial.println("\n[WiFi] Network connection lost.");
        _wasConnected = false;
        _lastReconnectAttempt = millis();
    }

    if (!connected) {
        unsigned long now = millis();
        if (now - _lastReconnectAttempt >= _reconnectInterval) {
            _lastReconnectAttempt = now;
            Serial.println("[WiFi] Attempting reconnection...");
            WiFi.disconnect();
            WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
        }
    }
}

void WiFiManager::reconnect() {
    _lastReconnectAttempt = millis();
    WiFi.disconnect();
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

bool WiFiManager::isConnected() {
    return (WiFi.status() == WL_CONNECTED);
}

String WiFiManager::getMacAddress() {
    if (_effectiveMac.length() > 0) {
        return _effectiveMac;
    }
    return WiFi.macAddress();
}

String WiFiManager::getIPAddress() {
    if (isConnected()) {
        return WiFi.localIP().toString();
    }
    return "0.0.0.0";
}

int WiFiManager::getRSSI() {
    if (isConnected()) {
        return WiFi.RSSI();
    }
    return 0;
}

void WiFiManager::initTimeSync() {
    Serial.println("[NTP] Initializing time synchronization...");
    configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER_1, NTP_SERVER_2);

    struct tm timeinfo;
    if (getLocalTime(&timeinfo, 3000)) {
        _timeSynced = true;
        char timeStr[64];
        strftime(timeStr, sizeof(timeStr), "%Y-%m-%d %H:%M:%S UTC", &timeinfo);
        Serial.printf("[NTP] Time synchronized: %s\n", timeStr);
    } else {
        Serial.println("[NTP] Time sync pending or timed out.");
    }
}

bool WiFiManager::isTimeSynchronized() {
    return _timeSynced;
}

String WiFiManager::getISOTimestamp() {
    struct tm timeinfo;
    if (getLocalTime(&timeinfo, 100)) {
        _timeSynced = true;
        char buffer[30];
        strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
        return String(buffer);
    }

    // Fallback: Return estimated ISO time or synthetic timestamp with uptime
    unsigned long sec = millis() / 1000;
    char fallback[32];
    snprintf(fallback, sizeof(fallback), "1970-01-01T00:%02lu:%02luZ", (sec / 60) % 60, sec % 60);
    return String(fallback);
}
