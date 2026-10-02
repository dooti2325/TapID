#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>

// ============================================================================
// TapID ESP32 RFID Attendance Scanner (Standalone & Cloud Connected)
// Directly compatible with TapID Schema, Hardware Terminal, & Live API
// ============================================================================

// =========================
// PIN CONFIGURATION
// =========================
// Standard ESP32 Hardware SPI: SCK=GPIO 18, MISO=GPIO 19, MOSI=GPIO 23
#define SS_PIN       5    // RC522 SDA / SS pin (Change to 21 if using 21)
#define RST_PIN      22   // RC522 Reset pin

#define GREEN_LED    26   // Green LED: Attendance Recorded / Authorized
#define RED_LED      27   // Red LED: Unauthorized Card / Access Denied
#define BUZZER       25   // Acoustic Buzzer

// =========================
// WI-FI & TAPID BACKEND CONFIG (OPTIONAL)
// Set ENABLE_WIFI to true to push live taps directly to the TapID backend!
// =========================
#define ENABLE_WIFI         false                   // Set to true to send taps to TapID API
const char* WIFI_SSID       = "Your_WiFi_SSID";
const char* WIFI_PASSWORD   = "Your_WiFi_Password";
const char* API_URL         = "http://192.168.1.100:3000/api/attendance/record";
const char* DEVICE_API_KEY  = "tapid-esp32-device-key-2026";
const char* DEFAULT_MAC     = "24:0A:C4:00:00:01";  // Seeded classroom C-102 terminal MAC

// =========================
// RFID READER OBJECT
// =========================
MFRC522 rfid(SS_PIN, RST_PIN);

// =========================
// REGISTERED STUDENT CARDS (Pre-loaded from TapID Database)
// =========================
struct RegisteredCard {
    byte uidBytes[4];
    const char* uidColon;
    const char* studentName;
    const char* enrollment;
};

// Registered cards matching database/seed.sql
const RegisteredCard REGISTERED_CARDS[] = {
    // Dootiballav Gouriprasanna Saha (Enr: GHRUA23011060348)
    { {0x44, 0x71, 0xFD, 0x06}, "44:71:FD:06", "Dootiballav Gouriprasanna Saha", "GHRUA23011060348" },
    { {0x24, 0x0A, 0xC4, 0x00}, "24:0A:C4:00", "Dootiballav Gouriprasanna Saha", "GHRUA23011060348" },

    // Other classmates from Section G1
    { {0x24, 0x0A, 0xC4, 0x01}, "24:0A:C4:01", "SANSKAR LAXMAN GADDEWAR",        "GHRUA23011060258" },
    { {0x24, 0x0A, 0xC4, 0x02}, "24:0A:C4:02", "HARSHAL SUHAS VIDHATE",          "GHRUA23011060359" },
    { {0x88, 0xE1, 0x90, 0x3F}, "88:E1:90:3F", "SAMIKSHA PRABHAKAR MOHITKAR",    "GHRUA23011060250" },
    { {0x3A, 0xBC, 0xD1, 0x42}, "3A:BC:D1:42", "VEDANT MANISH BAVARIA",          "GHRUA23011060205" }
};
const int TOTAL_REGISTERED_CARDS = sizeof(REGISTERED_CARDS) / sizeof(REGISTERED_CARDS[0]);

// =========================
// DEBOUNCE TRACKING
// =========================
String lastScannedUid = "";
unsigned long lastScanTime = 0;
const unsigned long DEBOUNCE_MS = 2500; // 2.5 second duplicate tap prevention

// Function declarations
String getUidSpaces();
String getUidColons();
const RegisteredCard* checkAuthorization();
void accessGranted(const RegisteredCard* card);
void accessDenied();
void notifyDebounced();
void sendAttendanceToCloud(const String& uidColon);

// =========================
// SETUP
// =========================
void setup() {
    Serial.begin(115200);
    delay(500);

    // Configure GPIOs
    pinMode(GREEN_LED, OUTPUT);
    pinMode(RED_LED, OUTPUT);
    pinMode(BUZZER, OUTPUT);

    // Initial state: Everything OFF
    digitalWrite(GREEN_LED, LOW);
    digitalWrite(RED_LED, LOW);
    digitalWrite(BUZZER, LOW);

    // Start Hardware SPI Bus
    SPI.begin();

    // Initialize MFRC522
    rfid.PCD_Init();
    delay(100);
    rfid.PCD_SetAntennaGain(MFRC522::RxGain_max);

    Serial.println();
    Serial.println("==================================================");
    Serial.println("         TapID ESP32 RFID ATTENDANCE SCANNER");
    Serial.println("==================================================");
    Serial.printf("SS Pin: %d | RST Pin: %d | Green LED: %d | Red LED: %d | Buzzer: %d\n",
                  SS_PIN, RST_PIN, GREEN_LED, RED_LED, BUZZER);
    Serial.printf("Local Directory: %d registered student cards pre-loaded\n", TOTAL_REGISTERED_CARDS);

    byte version = rfid.PCD_ReadRegister(MFRC522::VersionReg);
    Serial.printf("Reader Firmware Version: 0x%02X\n", version);

    if (version == 0x00 || version == 0xFF) {
        Serial.println("[ERROR] Communication with MFRC522 failed! Check SPI wiring:");
        Serial.println("  SDA -> GPIO 5, SCK -> GPIO 18, MOSI -> GPIO 23, MISO -> GPIO 19, RST -> GPIO 22");
    } else {
        Serial.println("[OK] MFRC522 Reader is online and ready.");
    }

    if (ENABLE_WIFI) {
        Serial.printf("Connecting to Wi-Fi: %s...", WIFI_SSID);
        WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
        int attempts = 0;
        while (WiFi.status() != WL_CONNECTED && attempts < 20) {
            delay(500);
            Serial.print(".");
            attempts++;
        }
        if (WiFi.status() == WL_CONNECTED) {
            Serial.printf("\n[OK] Connected! IP: %s | MAC: %s\n",
                          WiFi.localIP().toString().c_str(), WiFi.macAddress().c_str());
        } else {
            Serial.println("\n[WARN] Wi-Fi connection timed out. Running in Standalone Mode.");
        }
    } else {
        Serial.println("Running in Standalone Local Verification Mode.");
    }

    // Startup confirmation chime
    digitalWrite(GREEN_LED, HIGH);
    digitalWrite(BUZZER, HIGH);
    delay(100);
    digitalWrite(BUZZER, LOW);
    digitalWrite(GREEN_LED, LOW);

    Serial.println();
    Serial.println("Waiting for RFID card to be tapped...");
    Serial.println("--------------------------------------------------");
}

// =========================
// MAIN LOOP
// =========================
void loop() {
    // 1. Check if a new card is placed near the reader
    if (!rfid.PICC_IsNewCardPresent()) {
        return;
    }

    // 2. Read serial data from card
    if (!rfid.PICC_ReadCardSerial()) {
        return;
    }

    // 3. Format UIDs
    String uidSpaces = getUidSpaces();
    String uidColon  = getUidColons();

    Serial.println("--------------------------------------------------");
    Serial.print("Card Scanned! UID (Raw):   ");
    Serial.println(uidSpaces);
    Serial.print("TapID Database UID:       ");
    Serial.println(uidColon);

    // 4. Check debounce cooldown
    unsigned long now = millis();
    if (uidColon.equalsIgnoreCase(lastScannedUid) && (now - lastScanTime < DEBOUNCE_MS)) {
        notifyDebounced();
    } else {
        lastScannedUid = uidColon;
        lastScanTime = now;

        // 5. Check authorization against database records
        const RegisteredCard* matchedCard = checkAuthorization();

        if (matchedCard != nullptr) {
            accessGranted(matchedCard);

            // Optional: Forward to live TapID cloud backend
            if (ENABLE_WIFI && WiFi.status() == WL_CONNECTED) {
                sendAttendanceToCloud(uidColon);
            }
        } else {
            accessDenied();
        }
    }

    // 6. Halt card communication
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();

    // Stabilization delay
    delay(500);
}

// =========================
// UID FORMATTERS
// =========================
String getUidSpaces() {
    String str = "";
    for (byte i = 0; i < rfid.uid.size; i++) {
        if (rfid.uid.uidByte[i] < 0x10) str += "0";
        str += String(rfid.uid.uidByte[i], HEX);
        if (i < rfid.uid.size - 1) str += " ";
    }
    str.toUpperCase();
    return str;
}

String getUidColons() {
    String str = "";
    for (byte i = 0; i < rfid.uid.size; i++) {
        if (rfid.uid.uidByte[i] < 0x10) str += "0";
        str += String(rfid.uid.uidByte[i], HEX);
        if (i < rfid.uid.size - 1) str += ":";
    }
    str.toUpperCase();
    return str;
}

// =========================
// AUTHORIZATION CHECK
// =========================
const RegisteredCard* checkAuthorization() {
    if (rfid.uid.size != 4) return nullptr;

    for (int i = 0; i < TOTAL_REGISTERED_CARDS; i++) {
        bool match = true;
        for (byte b = 0; b < 4; b++) {
            if (rfid.uid.uidByte[b] != REGISTERED_CARDS[i].uidBytes[b]) {
                match = false;
                break;
            }
        }
        if (match) {
            return &REGISTERED_CARDS[i];
        }
    }
    return nullptr;
}

// =========================
// ACCESS GRANTED FEEDBACK
// =========================
void accessGranted(const RegisteredCard* card) {
    Serial.println();
    Serial.println(">>> ACCESS GRANTED - ATTENDANCE RECORDED <<<");
    Serial.printf("Welcome, %s!\n", card->studentName);
    Serial.printf("Enrollment:  %s\n", card->enrollment);
    Serial.printf("Card UID:    %s\n", card->uidColon);
    Serial.println();

    // Green LED ON
    digitalWrite(GREEN_LED, HIGH);

    // One short confirmation beep
    digitalWrite(BUZZER, HIGH);
    delay(200);
    digitalWrite(BUZZER, LOW);

    // Keep green LED visible
    delay(1000);
    digitalWrite(GREEN_LED, LOW);
}

// =========================
// ACCESS DENIED FEEDBACK
// =========================
void accessDenied() {
    Serial.println();
    Serial.println(">>> ACCESS DENIED <<<");
    Serial.println("Unauthorized or Revoked RFID Card!");
    Serial.println();

    // Red LED ON
    digitalWrite(RED_LED, HIGH);

    // Three warning beeps
    for (int i = 0; i < 3; i++) {
        digitalWrite(BUZZER, HIGH);
        delay(150);
        digitalWrite(BUZZER, LOW);
        delay(150);
    }

    // Keep red LED visible
    delay(700);
    digitalWrite(RED_LED, LOW);
}

// =========================
// DEBOUNCE FEEDBACK
// =========================
void notifyDebounced() {
    Serial.println("[INFO] Card already recorded. Cooldown active (2.5s).");

    // Two rapid clicks
    digitalWrite(BUZZER, HIGH);
    delay(60);
    digitalWrite(BUZZER, LOW);
    delay(60);
    digitalWrite(BUZZER, HIGH);
    delay(60);
    digitalWrite(BUZZER, LOW);
}

// =========================
// SEND TAP TO TAPID BACKEND API
// =========================
void sendAttendanceToCloud(const String& uidColon) {
    HTTPClient http;
    http.begin(API_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-Device-Key", DEVICE_API_KEY);

    String deviceMac = (WiFi.status() == WL_CONNECTED) ? WiFi.macAddress() : DEFAULT_MAC;
    String payload = "{\"mac_address\":\"" + deviceMac + "\",\"rfid_uid\":\"" + uidColon + "\"}";

    Serial.println("[API] Forwarding tap to TapID Server...");
    int httpCode = http.POST(payload);

    if (httpCode > 0) {
        String resp = http.getString();
        Serial.printf("[API Response %d]: %s\n", httpCode, resp.c_str());
    } else {
        Serial.printf("[API Error]: %s\n", http.errorToString(httpCode).c_str());
    }

    http.end();
}
