#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include "config.h"
#include "secrets.h"

MFRC522 mfrc522(SS_PIN, RST_PIN);

void setup() {
    Serial.begin(115200);
    SPI.begin();
    mfrc522.PCD_Init();
    
    pinMode(BUZZER_PIN, OUTPUT);
    pinMode(LED_GREEN_PIN, OUTPUT);
    pinMode(LED_RED_PIN, OUTPUT);

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi connected");
}

void loop() {
    if (WiFi.status() == WL_CONNECTED) {
        if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
            String rfid_uid = "";
            for (byte i = 0; i < mfrc522.uid.size; i++) {
                rfid_uid += String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : "");
                rfid_uid += String(mfrc522.uid.uidByte[i], HEX);
            }
            rfid_uid.toUpperCase();
            
            Serial.println("Card UID: " + rfid_uid);
            sendAttendance(rfid_uid);
            
            mfrc522.PICC_HaltA();
            mfrc522.PCD_StopCrypto1();
            delay(1000); // Debounce
        }
    }
}

void sendAttendance(String uid) {
    HTTPClient http;
    String url = String(API_BASE_URL) + "/attendance/record";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    
    String payload = "{\"rfid_uid\":\"" + uid + "\",\"mac_address\":\"" + DEVICE_MAC + "\"}";
    int httpResponseCode = http.POST(payload);
    
    if (httpResponseCode == 200) {
        // Success
        digitalWrite(LED_GREEN_PIN, HIGH);
        tone(BUZZER_PIN, 1000, 200);
        delay(500);
        digitalWrite(LED_GREEN_PIN, LOW);
    } else {
        // Failure or Duplicate
        digitalWrite(LED_RED_PIN, HIGH);
        tone(BUZZER_PIN, 500, 500);
        delay(500);
        digitalWrite(LED_RED_PIN, LOW);
    }
    http.end();
}