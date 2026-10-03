#include "wifi_manager.h"

WiFiManager::WiFiManager()
    : _lastReconnectAttempt(0),
      _reconnectInterval(WIFI_RETRY_INTERVAL_MS),
      _wasConnected(false),
      _timeSynced(false),
      _portalRunning(false),
      _portalStartTime(0),
      _server(80) {}

void WiFiManager::loadCredentials() {
    _prefs.begin("tapid", false);
    _ssid = _prefs.getString("ssid", WIFI_SSID);
    _password = _prefs.getString("pass", WIFI_PASSWORD);
    _serverUrl = _prefs.getString("server", API_BASE_URL);
    _apiKey = _prefs.getString("key", DEVICE_API_KEY);
    _prefs.end();

    if (_ssid.length() == 0) _ssid = String(WIFI_SSID);
    if (_password.length() == 0) _password = String(WIFI_PASSWORD);
    if (_serverUrl.length() == 0) _serverUrl = String(API_BASE_URL);
    if (_apiKey.length() == 0) _apiKey = String(DEVICE_API_KEY);
}

void WiFiManager::begin() {
    loadCredentials();

    // Determine hardware MAC address
    String configuredMac = String(DEVICE_MAC);
    configuredMac.trim();
    if (configuredMac.length() > 0) {
        _effectiveMac = configuredMac;
    } else {
        _effectiveMac = WiFi.macAddress();
    }

    WiFi.mode(WIFI_STA);

    Serial.println("\n[WiFi] Initializing connection...");
    Serial.printf("[WiFi] Target SSID: %s\n", _ssid.c_str());
    Serial.printf("[WiFi] Device MAC:  %s\n", _effectiveMac.c_str());
    Serial.printf("[WiFi] Server URL:  %s\n", _serverUrl.c_str());

    WiFi.begin(_ssid.c_str(), _password.c_str());
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
        Serial.println("\n[WiFi] Initial connection timed out. Background reconnection active.");
        _wasConnected = false;
    }
}

void WiFiManager::loop() {
    if (_portalRunning) {
        _dnsServer.processNextRequest();
        _server.handleClient();

        // Check if config portal timed out
        if (millis() - _portalStartTime >= (AP_PORTAL_TIMEOUT_SEC * 1000UL)) {
            Serial.println("[PORTAL] Config portal timed out. Exiting AP mode.");
            stopConfigPortal();
        }
        return;
    }

    bool connected = (WiFi.status() == WL_CONNECTED);

    if (connected && !_wasConnected) {
        Serial.println("\n[WiFi] Reconnected to network!");
        Serial.printf("[WiFi] IP Address: %s\n", WiFi.localIP().toString().c_str());
        _wasConnected = true;
        if (!_timeSynced) {
            initTimeSync();
        }
    } else if (!connected && _wasConnected) {
        Serial.println("\n[WiFi] Connection lost. Background retry active.");
        _wasConnected = false;
        _lastReconnectAttempt = millis();
    }

    if (!connected) {
        unsigned long now = millis();
        if (now - _lastReconnectAttempt >= _reconnectInterval) {
            _lastReconnectAttempt = now;
            Serial.println("[WiFi] Reconnecting...");
            WiFi.disconnect();
            WiFi.begin(_ssid.c_str(), _password.c_str());
        }
    }
}

void WiFiManager::reconnect() {
    _lastReconnectAttempt = millis();
    WiFi.disconnect();
    WiFi.begin(_ssid.c_str(), _password.c_str());
}

bool WiFiManager::isConnected() {
    return (WiFi.status() == WL_CONNECTED);
}

bool WiFiManager::isConfigPortalActive() const {
    return _portalRunning;
}

String WiFiManager::getEffectiveServerUrl() {
    return _serverUrl;
}

String WiFiManager::getEffectiveApiKey() {
    return _apiKey;
}

String WiFiManager::generatePortalHtml() {
    String html = "<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width,initial-scale=1'>";
    html += "<title>TapID Terminal Setup</title>";
    html += "<style>body{font-family:sans-serif;background:#0f172a;color:#f8fafc;padding:20px;margin:0}";
    html += ".card{max-width:440px;margin:20px auto;background:#1e293b;padding:24px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.4)}";
    html += "h2{color:#38bdf8;margin-top:0;font-size:22px;text-align:center}";
    html += "label{display:block;margin-top:14px;font-size:13px;color:#94a3b8;font-weight:600}";
    html += "input{width:100%;box-sizing:border-box;padding:10px 12px;margin-top:6px;background:#0f172a;border:1px solid #334155;border-radius:6px;color:#fff;font-size:14px}";
    html += "button{width:100%;padding:12px;margin-top:20px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;font-size:15px}";
    html += ".btn-reset{background:#dc2626;margin-top:10px}";
    html += ".meta{text-align:center;font-size:12px;color:#64748b;margin-top:16px}";
    html += "</style></head><body><div class='card'>";
    html += "<h2>TapID Terminal Setup</h2>";
    html += "<form action='/save' method='POST'>";
    html += "<label>Wi-Fi Network (SSID)</label><input type='text' name='ssid' value='" + _ssid + "' required>";
    html += "<label>Wi-Fi Password</label><input type='password' name='pass' value='" + _password + "'>";
    html += "<label>TapID Server API URL</label><input type='text' name='server' value='" + _serverUrl + "' required>";
    html += "<label>Device API Key</label><input type='text' name='key' value='" + _apiKey + "'>";
    html += "<button type='submit'>Save & Connect</button>";
    html += "</form>";
    html += "<form action='/reset' method='POST' onsubmit='return confirm(\"Reset to factory defaults?\")'>";
    html += "<button type='submit' class='btn-reset'>Factory Reset</button>";
    html += "</form>";
    html += "<div class='meta'>Device MAC: " + getMacAddress() + "</div>";
    html += "</div></body></html>";
    return html;
}

void WiFiManager::setupPortalRoutes() {
    _server.on("/", HTTP_GET, [this]() {
        _server.send(200, "text/html", generatePortalHtml());
    });

    _server.on("/save", HTTP_POST, [this]() {
        String newSsid = _server.arg("ssid");
        String newPass = _server.arg("pass");
        String newServer = _server.arg("server");
        String newKey = _server.arg("key");

        newSsid.trim();
        newPass.trim();
        newServer.trim();
        newKey.trim();

        _prefs.begin("tapid", false);
        if (newSsid.length() > 0) _prefs.putString("ssid", newSsid);
        _prefs.putString("pass", newPass);
        if (newServer.length() > 0) _prefs.putString("server", newServer);
        if (newKey.length() > 0) _prefs.putString("key", newKey);
        _prefs.end();

        String resp = "<html><body style='background:#0f172a;color:#fff;text-align:center;padding:50px;font-family:sans-serif;'>";
        resp += "<h2 style='color:#4ade80;'>Configuration Saved!</h2>";
        resp += "<p>Rebooting terminal and connecting to " + newSsid + "...</p>";
        resp += "</body></html>";
        _server.send(200, "text/html", resp);
        delay(1500);
        ESP.restart();
    });

    _server.on("/reset", HTTP_POST, [this]() {
        factoryReset();
        String resp = "<html><body style='background:#0f172a;color:#fff;text-align:center;padding:50px;font-family:sans-serif;'>";
        resp += "<h2 style='color:#f87171;'>Factory Reset Complete!</h2>";
        resp += "<p>Rebooting to defaults...</p>";
        resp += "</body></html>";
        _server.send(200, "text/html", resp);
        delay(1500);
        ESP.restart();
    });

    // Captive portal fallback
    _server.onNotFound([this]() {
        _server.sendHeader("Location", "/", true);
        _server.send(302, "text/plain", "");
    });
}

void WiFiManager::startConfigPortal() {
    if (_portalRunning) return;

    Serial.println("\n[PORTAL] Launching Wi-Fi Configuration Portal...");

    WiFi.disconnect();
    WiFi.mode(WIFI_AP);

    // Format SSID: TapID-Setup-XXXX using last 4 chars of chip MAC
    String mac = WiFi.macAddress();
    mac.replace(":", "");
    String apSsid = String(AP_SSID_PREFIX) + mac.substring(mac.length() - 4);

    WiFi.softAP(apSsid.c_str(), AP_PASSWORD);
    IPAddress apIP = WiFi.softAPIP();

    Serial.printf("[PORTAL] SoftAP SSID: %s\n", apSsid.c_str());
    Serial.printf("[PORTAL] AP Password: %s\n", AP_PASSWORD);
    Serial.printf("[PORTAL] Web Portal:  http://%s\n", apIP.toString().c_str());

    _dnsServer.start(53, "*", apIP);
    setupPortalRoutes();
    _server.begin();

    _portalRunning = true;
    _portalStartTime = millis();
}

void WiFiManager::stopConfigPortal() {
    if (!_portalRunning) return;
    _server.stop();
    _dnsServer.stop();
    WiFi.softAPdisconnect(true);
    _portalRunning = false;
    WiFi.mode(WIFI_STA);
    reconnect();
}

void WiFiManager::factoryReset() {
    Serial.println("[RESET] Performing factory reset (clearing NVS storage)...");
    _prefs.begin("tapid", false);
    _prefs.clear();
    _prefs.end();
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
    Serial.println("[NTP] Synchronizing accurate time via NTP...");
    configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER_1, NTP_SERVER_2, NTP_SERVER_3);

    struct tm timeinfo;
    if (getLocalTime(&timeinfo, 4000)) {
        _timeSynced = true;
        char timeStr[64];
        strftime(timeStr, sizeof(timeStr), "%Y-%m-%d %H:%M:%S", &timeinfo);
        Serial.printf("[NTP] Synchronized: %s\n", timeStr);
    } else {
        Serial.println("[NTP] Time synchronization pending in background.");
    }
}

bool WiFiManager::isTimeSynchronized() {
    return _timeSynced;
}

String WiFiManager::getISOTimestamp() {
    struct tm timeinfo;
    if (getLocalTime(&timeinfo, 80)) {
        _timeSynced = true;
        char buffer[32];
        strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
        return String(buffer);
    }

    // Monotonic fallback
    unsigned long sec = millis() / 1000;
    char fallback[32];
    snprintf(fallback, sizeof(fallback), "1970-01-01T00:%02lu:%02luZ", (sec / 60) % 60, sec % 60);
    return String(fallback);
}
