#include "ota_manager.h"

OTAManager::OTAManager() : _initialized(false) {}

void OTAManager::begin(const char* hostname, const char* password) {
    ArduinoOTA.setHostname(hostname);
    if (password && strlen(password) > 0) {
        ArduinoOTA.setPassword(password);
    }

    ArduinoOTA.onStart([]() {
        String type;
        if (ArduinoOTA.getCommand() == U_FLASH) {
            type = "sketch";
        } else {
            type = "filesystem";
        }
        Serial.println("[OTA] Firmware update initiated: " + type);
    });

    ArduinoOTA.onEnd([]() {
        Serial.println("\n[OTA] Firmware flash complete! Rebooting device...");
    });

    ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
        Serial.printf("[OTA] Flashing Progress: %u%%\r", (progress / (total / 100)));
    });

    ArduinoOTA.onError([](ota_error_t error) {
        Serial.printf("[OTA Error][%u]: ", error);
        if (error == OTA_AUTH_ERROR) Serial.println("Authentication Failed");
        else if (error == OTA_BEGIN_ERROR) Serial.println("Initialization Failed");
        else if (error == OTA_CONNECT_ERROR) Serial.println("Network Connect Failed");
        else if (error == OTA_RECEIVE_ERROR) Serial.println("Packet Receive Failed");
        else if (error == OTA_END_ERROR) Serial.println("Flash End Verification Failed");
    });

    ArduinoOTA.begin();
    _initialized = true;
    Serial.println("[OTA] Over-The-Air flash daemon listening on port 3232");
}

void OTAManager::handle() {
    if (_initialized) {
        ArduinoOTA.handle();
    }
}
