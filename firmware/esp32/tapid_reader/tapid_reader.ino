#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include "config.h"
#include "secrets.h"

MFRC522 mfrc522(SS_PIN, RST_PIN);

// ─── Offline Tap Buffer ────────────────────────────────
#define BUFFER_SIZE 50
struct TapEntry {
    String uid;
    unsigned long ts;
};
TapEntry tapBuffer[BUFFER_SIZE];
int bufferHead = 0;
int bufferTail = 0;
bool bufferFull = false;

// ─── WiFi Reconnection ─────────────────────────────────
void ensureWiFi() {
    if (WiFi.status() == WL_CONNECTED) return;
    Serial.println("WiFi lost. Reconnecting...");
    WiFi.disconnect();
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    unsigned long start = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - start < 10000) {
        delay(500);
        Serial.print(".");
    }
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi reconnected: " + WiFi.localIP().toString());
    } else {
        Serial.println("\nWiFi reconnect failed — buffering taps.");
    }
}

// ─── Buffer Management ─────────────────────────────────
bool addToBuffer(const String& uid) {
    if (bufferFull) return false;
    tapBuffer[bufferTail] = { uid, millis() };
    bufferTail = (bufferTail + 1) % BUFFER_SIZE;
    if (bufferTail == bufferHead) bufferFull = true;
    return true;
}

bool bufferEmpty() {
    return !bufferFull && (bufferHead == bufferTail);
}

// ─── HTTP POST ─────────────────────────────────────────
bool sendTap(const String& uid) {
    HTTPClient http;
    String url = String(API_BASE_URL) + "/attendance/record";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(5000);

    // Use DEVICE_MAC from secrets.h or WiFi MAC
    String mac = DEVICE_MAC[0] ? String(DEVICE_MAC) : WiFi.macAddress();
    String payload = "{\"rfid_uid\":\"" + uid + "\",\"mac_address\":\"" + mac + "\"}";

    int code = http.POST(payload);
    bool success = (code == 200 || code == 201);

    if (success) {
        digitalWrite(LED_GREEN_PIN, HIGH);
        tone(BUZZER_PIN, 1800, 180);
        delay(400);
        noTone(BUZZER_PIN);
        digitalWrite(LED_GREEN_PIN, LOW);
    } else {
        Serial.printf("HTTP %d for UID %s\n", code, uid.c_str());
        digitalWrite(LED_RED_PIN, HIGH);
        tone(BUZZER_PIN, 480, 450);
        delay(500);
        noTone(BUZZER_PIN);
        digitalWrite(LED_RED_PIN, LOW);
    }
    http.end();
    return success;
}

// ─── Flush Offline Buffer ──────────────────────────────
void flushBuffer() {
    if (bufferEmpty()) return;
    Serial.printf("Flushing %d buffered tap(s)...\n",
        bufferFull ? BUFFER_SIZE : (bufferTail - bufferHead + BUFFER_SIZE) % BUFFER_SIZE);

    while (!bufferEmpty()) {
        bool sent = sendTap(tapBuffer[bufferHead].uid);
        if (!sent) break; // stop if WiFi is gone again
        bufferHead = (bufferHead + 1) % BUFFER_SIZE;
        bufferFull = false;
        delay(200); // rate-limit
    }
}

// ─── Setup ─────────────────────────────────────────────
void setup() {
    Serial.begin(115200);
    SPI.begin();
    mfrc522.PCD_Init();

    pinMode(BUZZER_PIN,    OUTPUT);
    pinMode(LED_GREEN_PIN, OUTPUT);
    pinMode(LED_RED_PIN,   OUTPUT);

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi connected: " + WiFi.localIP().toString());
    Serial.println("TapID Reader Ready.");
}

// ─── Main Loop ─────────────────────────────────────────
void loop() {
    ensureWiFi();

    // Flush buffered taps when back online
    if (WiFi.status() == WL_CONNECTED && !bufferEmpty()) {
        flushBuffer();
    }

    if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
        delay(50);
        return;
    }

    // Build UID hex string (FIX: threshold is 16, not 0x10)
    String uid = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
        if (mfrc522.uid.uidByte[i] < 16) uid += "0";
        uid += String(mfrc522.uid.uidByte[i], HEX);
    }
    uid.toUpperCase();
    Serial.println("Tapped UID: " + uid);

    mfrc522.PICC_HaltA();
    mfrc522.PCD_StopCrypto1();

    if (WiFi.status() == WL_CONNECTED) {
        bool ok = sendTap(uid);
        if (!ok) {
            // Server rejected (e.g. card not registered) — buffer if it was a comms error
        }
    } else {
        // Offline — buffer it
        bool buffered = addToBuffer(uid);
        if (buffered) {
            Serial.println("Tap buffered (offline): " + uid);
            tone(BUZZER_PIN, 800, 100); delay(150); tone(BUZZER_PIN, 800, 100);
        } else {
            Serial.println("Buffer full — tap dropped: " + uid);
        }
    }

    delay(1000); // Debounce
}