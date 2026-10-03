#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <DNSServer.h>
#include <Preferences.h>
#include <time.h>
#include "config.h"
#include "secrets.h"

class WiFiManager {
public:
    WiFiManager();

    void begin();
    void loop();

    bool isConnected();
    void reconnect();

    // Mode Management
    bool isConfigPortalActive() const;
    void startConfigPortal();
    void stopConfigPortal();
    void factoryReset();

    // Device Information
    String getMacAddress();
    String getIPAddress();
    int getRSSI();
    String getEffectiveServerUrl();
    String getEffectiveApiKey();

    // Time & NTP
    void initTimeSync();
    bool isTimeSynchronized();
    String getISOTimestamp();

private:
    unsigned long _lastReconnectAttempt;
    unsigned long _reconnectInterval;
    bool _wasConnected;
    bool _timeSynced;
    String _effectiveMac;

    // Preferences (NVS storage)
    Preferences _prefs;
    String _ssid;
    String _password;
    String _serverUrl;
    String _apiKey;

    // SoftAP & Web Portal
    bool _portalRunning;
    unsigned long _portalStartTime;
    WebServer _server;
    DNSServer _dnsServer;

    void loadCredentials();
    void setupPortalRoutes();
    String generatePortalHtml();
};

#endif // WIFI_MANAGER_H
