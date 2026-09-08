#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <Arduino.h>
#include <WiFi.h>
#include <time.h>
#include "config.h"
#include "secrets.h"

class WiFiManager {
public:
    WiFiManager();
    void begin();
    void loop();

    bool isConnected();
    String getMacAddress();
    String getIPAddress();
    int getRSSI();
    String getISOTimestamp();
    bool isTimeSynchronized();

    // Force reconnection attempt
    void reconnect();

private:
    unsigned long _lastReconnectAttempt;
    unsigned long _reconnectInterval;
    bool _wasConnected;
    bool _timeSynced;
    String _effectiveMac;

    void initTimeSync();
};

#endif // WIFI_MANAGER_H
