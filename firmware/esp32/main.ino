#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>

// --- Configuration ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Replace with your backend IP or Domain (e.g. "http://192.168.1.100:3000/api/attendance/record")
const String apiUrl = "http://YOUR_BACKEND_IP:3000/api/attendance/record";

// --- Hardware Pins ---
#define RST_PIN   22 // Reset pin
#define SS_PIN    21 // Slave Select pin (SDA)
#define BUZZER_PIN 25 // Optional buzzer
#define LED_PIN    26 // Optional LED

MFRC522 mfrc522(SS_PIN, RST_PIN);
MFRC522::MIFARE_Key key;

void setup() {
  Serial.begin(115200);
  SPI.begin();
  mfrc522.PCD_Init();

  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);

  // Initialize MIFARE keys to default FFFFFFFFFFFF
  for (byte i = 0; i < 6; i++) {
    key.keyByte[i] = 0xFF;
  }

  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
  Serial.print("MAC Address: ");
  Serial.println(WiFi.macAddress());

  Serial.println("TapID Device Ready. Tap RFID/NFC Card...");
}

// Helper to print block data as string
void printBlockData(byte blockAddr) {
  byte buffer[18];
  byte size = sizeof(buffer);
  
  MFRC522::StatusCode status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, blockAddr, &key, &(mfrc522.uid));
  if (status != MFRC522::STATUS_OK) {
    Serial.print("Auth failed for block ");
    Serial.println(blockAddr);
    return;
  }
  
  status = mfrc522.MIFARE_Read(blockAddr, buffer, &size);
  if (status == MFRC522::STATUS_OK) {
    Serial.print("Data in block ");
    Serial.print(blockAddr);
    Serial.print(": ");
    for (byte i = 0; i < 16; i++) {
      if (buffer[i] >= 32 && buffer[i] <= 126) {
        Serial.print((char)buffer[i]); // Print ascii
      } else {
        Serial.print(".");
      }
    }
    Serial.println();
  }
}

void loop() {
  if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
    delay(50);
    return;
  }

  digitalWrite(LED_PIN, HIGH);
  tone(BUZZER_PIN, 1000, 100);

  // 1. Get UID
  String rfidUid = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    rfidUid += String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : "");
    rfidUid += String(mfrc522.uid.uidByte[i], HEX);
  }
  rfidUid.toUpperCase();
  Serial.println("\n--- New Card Tapped ---");
  Serial.println("UID: " + rfidUid);

  // 2. Read Student Info (Assuming Name is block 1, Enroll No block 2, Section block 4, etc.)
  // Adjust these block addresses based on where your app actually wrote the data.
  Serial.println("Reading Student Info from Card Sectors...");
  printBlockData(1); // Read Name
  printBlockData(2); // Read Enrollment
  printBlockData(4); // Read Section & Roll No
  
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();

  // 3. Send UID to Backend
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(apiUrl);
    http.addHeader("Content-Type", "application/json");

    String jsonPayload = "{\"rfid_uid\":\"" + rfidUid + "\", \"mac_address\":\"" + WiFi.macAddress() + "\"}";
    
    int httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("HTTP Response Code: " + String(httpResponseCode));
      Serial.println("Response: " + response);
      
      // Success feedback
      if(httpResponseCode == 200) {
        tone(BUZZER_PIN, 2000, 200);
      } else {
        tone(BUZZER_PIN, 500, 500); // Error tone
      }
    } else {
      Serial.println("Error on sending POST: " + String(httpResponseCode));
      tone(BUZZER_PIN, 500, 500); // Error tone
    }
    http.end();
  } else {
    Serial.println("WiFi Disconnected!");
  }

  digitalWrite(LED_PIN, LOW);
  delay(1000); // Debounce delay
}
