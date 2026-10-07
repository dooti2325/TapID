#include <Arduino.h>
#include <HTTPClient.h>
#include <MFRC522.h>
#include <SPI.h>
#include <WiFiManager.h>
#include <WiFiClientSecure.h>

// Backend API Configuration
const char *BACKEND_URL =
    "https://tapid-14ao.onrender.com/api/attendance/record";
const char *HEARTBEAT_URL =
    "https://tapid-14ao.onrender.com/api/devices/heartbeat";
const char *DEVICE_API_KEY = "tapid-esp32-device-key-2026";

// Pin Definitions for ESP32
#define RST_PIN 22
#define SS_PIN 5
#define GREEN_LED_PIN 32
#define RED_LED_PIN 33
#define BUZZER_PIN 25

MFRC522 mfrc522(SS_PIN, RST_PIN);

unsigned long lastTapTime = 0;
String lastTapUID = "";
const unsigned long TAP_COOLDOWN = 3000; // 3 seconds

enum TapResult { CORRECT_SECTION, WRONG_SECTION, UNKNOWN };

TapResult checkStudent(String uid, bool isProxy = false);

void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  WiFiClientSecure client;
  client.setInsecure(); 
  
  HTTPClient http;
  http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
  http.begin(client, HEARTBEAT_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Key", DEVICE_API_KEY);
  
  String macAddress = WiFi.macAddress();
  String jsonBody = "{\"mac_address\":\"" + macAddress + "\"}";
  
  Serial.println("Sending Heartbeat to mark device as Online...");
  int httpResponseCode = http.POST(jsonBody);
  Serial.print("Heartbeat Response [");
  Serial.print(httpResponseCode);
  Serial.println("]");
  http.end();
}

// Authenticate and record attendance via Node.js Backend connected to Aiven
TapResult checkStudent(String uid, bool isProxy) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Error: WiFi not connected");
    return UNKNOWN;
  }

  // Use WiFiClientSecure to handle HTTPS for Render
  WiFiClientSecure client;
  client.setInsecure(); // Ignore SSL certificate validation for simplicity

  HTTPClient http;
  // Follow redirects just in case
  http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
  http.begin(client, BACKEND_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Key", DEVICE_API_KEY);

  String macAddress = WiFi.macAddress();
  String jsonBody =
      "{\"rfid_uid\":\"" + uid + "\", \"mac_address\":\"" + macAddress + "\"";
  if (isProxy) {
    jsonBody += ", \"is_proxy\": true";
  }
  jsonBody += "}";

  Serial.println("Sending to backend: " + jsonBody);

  int httpResponseCode = http.POST(jsonBody);
  String payload = http.getString();
  http.end();

  Serial.print("Backend Response [");
  Serial.print(httpResponseCode);
  Serial.print("]: ");
  Serial.println(payload);

  if (isProxy)
    return UNKNOWN; // Proxy indication is handled separately

  if (httpResponseCode >= 200 && httpResponseCode < 300) {
    if (payload.indexOf("\"status\":\"wrong_section\"") > 0 ||
        payload.indexOf("wrong_section") > 0) {
      return WRONG_SECTION;
    }
    return CORRECT_SECTION;
  } else if (httpResponseCode == 400 && payload.indexOf("wrong_section") > 0) {
    return WRONG_SECTION;
  } else {
    return UNKNOWN;
  }
}

// Indicator State Machine variables
enum IndicatorState { IDLE, CORRECT, WRONG, UNKNOWN_STATE, PROXY };

void setIndicatorState(IndicatorState newState);

IndicatorState currentState = IDLE;
unsigned long stateStartTime = 0;

// Initialize indicators state
void setIndicatorState(IndicatorState newState) {
  currentState = newState;
  stateStartTime = millis();

  // Turn off all initially
  digitalWrite(GREEN_LED_PIN, LOW);
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);
}

// Non-blocking indicator handling
void handleIndicators() {
  if (currentState == IDLE)
    return;

  unsigned long now = millis();
  unsigned long elapsed = now - stateStartTime;

  // All states reset after 3 seconds
  if (elapsed >= 3000) {
    setIndicatorState(IDLE);
    return;
  }

  switch (currentState) {
  case CORRECT:
    // Green LED blink (or stay on) + 1 beep
    // Blink green and beep for first 200ms
    digitalWrite(GREEN_LED_PIN, HIGH);
    if (elapsed < 200) {
      digitalWrite(BUZZER_PIN, HIGH);
    } else {
      digitalWrite(BUZZER_PIN, LOW);
    }
    break;

  case WRONG:
    // Red LED blink + 3 beeps (each beep 150ms on, 150ms off)
    if (elapsed < 900) {
      int cycle = elapsed / 150;
      if (cycle % 2 == 0) { // On state for blink and beep
        digitalWrite(RED_LED_PIN, HIGH);
        digitalWrite(BUZZER_PIN, HIGH);
      } else { // Off state
        digitalWrite(RED_LED_PIN, LOW);
        digitalWrite(BUZZER_PIN, LOW);
      }
    } else {
      // Red LED stays on to indicate invalid until 3s
      digitalWrite(RED_LED_PIN, HIGH);
      digitalWrite(BUZZER_PIN, LOW);
    }
    break;

  case UNKNOWN_STATE:
    // Red LED on + Error beep (1s long beep)
    digitalWrite(RED_LED_PIN, HIGH);
    if (elapsed < 1000) {
      digitalWrite(BUZZER_PIN, HIGH);
    } else {
      digitalWrite(BUZZER_PIN, LOW);
    }
    break;

  case PROXY:
    // Special warning pattern: Rapid blink both LEDs and fast beep
    if ((elapsed / 100) % 2 == 0) {
      digitalWrite(GREEN_LED_PIN, HIGH);
      digitalWrite(RED_LED_PIN, HIGH);
      digitalWrite(BUZZER_PIN, HIGH);
    } else {
      digitalWrite(GREEN_LED_PIN, LOW);
      digitalWrite(RED_LED_PIN, LOW);
      digitalWrite(BUZZER_PIN, LOW);
    }
    break;

  case IDLE:
    break;
  }
}

// Helper to convert UID to string
String getUIDString() {
  String uidStr = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    uidStr += String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : "");
    uidStr += String(mfrc522.uid.uidByte[i], HEX);
  }
  uidStr.toUpperCase();
  return uidStr;
}

void setup() {
  Serial.begin(115200);
  SPI.begin();
  mfrc522.PCD_Init();

  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  // Ensure everything is off initially
  digitalWrite(GREEN_LED_PIN, LOW);
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);

  Serial.println("TapID Firmware Initialized.");

  Serial.println("Starting WiFi connection...");
  WiFiManager wifiManager;
  // If no known WiFi credentials exist, it starts an Access Point named
  // "TapID_Setup"
  if (!wifiManager.autoConnect("TapID_Setup")) {
    Serial.println("Failed to connect to WiFi and hit timeout. Restarting...");
    delay(3000);
    ESP.restart();
    delay(5000);
  }

  Serial.println("\nWiFi connected successfully!");
  
  // Happy double-beep to indicate WiFi connected
  digitalWrite(BUZZER_PIN, HIGH);
  delay(100);
  digitalWrite(BUZZER_PIN, LOW);
  delay(100);
  digitalWrite(BUZZER_PIN, HIGH);
  delay(100);
  digitalWrite(BUZZER_PIN, LOW);
  
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // Notify backend that this hardware is online
  sendHeartbeat();

  Serial.println("Ready for taps...");
}

unsigned long lastHeartbeatTime = 0;
const unsigned long HEARTBEAT_INTERVAL = 30000; // 30 seconds

void loop() {
  // Always handle non-blocking indicators
  handleIndicators();

  // Periodic heartbeat to keep device online
  unsigned long now = millis();
  if (now - lastHeartbeatTime >= HEARTBEAT_INTERVAL) {
    sendHeartbeat();
    lastHeartbeatTime = now;
  }

  // Look for new cards
  if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  String currentUID = getUIDString();

  // Logic: Two different IDs within 3 seconds -> Proxy detected
  // Logic: Duplicate tap -> Don't mark attendance again
  if (now - lastTapTime <= TAP_COOLDOWN) {
    if (currentUID == lastTapUID) {
      Serial.println("Duplicate tap. Ignored.");
      mfrc522.PICC_HaltA(); // Halt PICC so it doesn't trigger repeatedly in one
                            // tap
      return;
    } else {
      Serial.println(
          "WARNING: Proxy detected! Two different IDs tapped within 3s.");
      setIndicatorState(PROXY);
      lastTapTime = now;
      lastTapUID = currentUID;

      // Log proxy attempt to backend
      checkStudent(currentUID, true);

      mfrc522.PICC_HaltA();
      return;
    }
  }

  // Normal tap processing for a valid >3s gap tap
  lastTapTime = now;
  lastTapUID = currentUID;

  Serial.print("Scanned ID: ");
  Serial.println(currentUID);

  // Check the student status
  TapResult result = checkStudent(currentUID);

  switch (result) {
  case CORRECT_SECTION:
    Serial.println("Status: Correct Section - Present.");
    setIndicatorState(CORRECT);
    break;
  case WRONG_SECTION:
    Serial.println("Status: Wrong Section - Invalid.");
    setIndicatorState(WRONG);
    break;
  case UNKNOWN:
    Serial.println("Status: Unknown/Unassigned ID. Logging attempt.");
    // TODO: Log attempt to backend
    setIndicatorState(UNKNOWN_STATE);
    break;
  }

  // Halt PICC to stop reading the same card if held on reader
  mfrc522.PICC_HaltA();
}
