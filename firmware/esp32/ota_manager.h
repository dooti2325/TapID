#ifndef OTA_MANAGER_H
#define OTA_MANAGER_H

#include <Arduino.h>
#include <ArduinoOTA.h>

/**
 * ============================================================================
 * TapID ESP32 Over-The-Air (OTA) Firmware Manager
 * ============================================================================
 * Enables secure wireless flashing across campus classroom readers without
 * needing physical USB access.
 * ============================================================================
 */
class OTAManager {
public:
    OTAManager();
    void begin(const char* hostname = "tapid-reader", const char* password = "tapid-ota-secure-pass");
    void handle();
private:
    bool _initialized;
};

#endif // OTA_MANAGER_H
