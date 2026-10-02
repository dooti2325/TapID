#include <SPI.h>
#include <MFRC522.h>

// =============================================================================
// TapID ESP32 Standalone Hardware & RFID Test Sketch
// =============================================================================
// Pin Configuration:
//   - RC522 SDA / SS : GPIO 5
//   - RC522 SCK      : GPIO 18
//   - RC522 MOSI     : GPIO 23
//   - RC522 MISO     : GPIO 19
//   - RC522 RST      : GPIO 22
//   - Green Status LED: GPIO 26 (via 220-330 ohm resistor)
//   - Red Status LED  : GPIO 27 (via 220-330 ohm resistor)
//   - Acoustic Buzzer : GPIO 25 (Active 5V/3.3V Buzzer)
// =============================================================================

#define SS_PIN       5
#define RST_PIN      22

#define GREEN_LED    26
#define RED_LED      27
#define BUZZER       25

// =============================================================================
// RFID OBJECT
// =============================================================================
MFRC522 rfid(SS_PIN, RST_PIN);

// =============================================================================
// AUTHORIZED CARD
// UID: 44 71 FD 06 (Dootiballav Gouriprasanna Saha)
// =============================================================================
byte authorizedUID[] = {
  0x44,
  0x71,
  0xFD,
  0x06
};

const byte authorizedUIDSize = 4;

// Function prototypes
bool isAuthorized();
void accessGranted();
void accessDenied();

// =============================================================================
// SETUP
// =============================================================================
void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 2000) {
    // Wait briefly for serial monitor
  }

  // Configure output pins
  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);

  // Turn everything OFF initially
  digitalWrite(GREEN_LED, LOW);
  digitalWrite(RED_LED, LOW);
  digitalWrite(BUZZER, LOW);

  // Initialize Hardware SPI
  SPI.begin();

  // Initialize MFRC522 RFID Reader
  rfid.PCD_Init();
  delay(500);

  // Increase antenna gain to maximum for best card reading range
  rfid.PCD_SetAntennaGain(MFRC522::RxGain_max);

  Serial.println();
  Serial.println("================================");
  Serial.println("     TapID ESP32 RFID SYSTEM    ");
  Serial.println("================================");
  Serial.println("Pins: SS=5, RST=22, Green=26, Red=27, Buzzer=25");
  Serial.println("RFID Reader Ready...");
  Serial.println("Waiting for card scan...");
  Serial.println();
}

// =============================================================================
// MAIN LOOP
// =============================================================================
void loop() {
  // Check if a new card is present
  if (!rfid.PICC_IsNewCardPresent()) {
    return;
  }

  // Read the card serial
  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }

  // Display UID in formatted hexadecimal
  Serial.println("--------------------------------");
  Serial.print("Card UID: ");

  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) {
      Serial.print("0");
    }
    Serial.print(rfid.uid.uidByte[i], HEX);
    Serial.print(" ");
  }
  Serial.println();

  // Check authorization
  if (isAuthorized()) {
    accessGranted();
  } else {
    accessDenied();
  }

  // Stop communication with card
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();

  // 1-second cooldown delay before another scan
  delay(1000);
}

// =============================================================================
// CHECK AUTHORIZED UID
// =============================================================================
bool isAuthorized() {
  if (rfid.uid.size != authorizedUIDSize) {
    return false;
  }

  for (byte i = 0; i < authorizedUIDSize; i++) {
    if (rfid.uid.uidByte[i] != authorizedUID[i]) {
      return false;
    }
  }

  return true;
}

// =============================================================================
// ACCESS GRANTED
// =============================================================================
void accessGranted() {
  Serial.println("ACCESS GRANTED");
  Serial.println("Welcome, Dootiballav!");
  Serial.println();

  // Green LED ON
  digitalWrite(GREEN_LED, HIGH);

  // One short beep (200ms)
  digitalWrite(BUZZER, HIGH);
  delay(200);
  digitalWrite(BUZZER, LOW);

  // Keep green LED ON
  delay(1000);

  // Green LED OFF
  digitalWrite(GREEN_LED, LOW);
}

// =============================================================================
// ACCESS DENIED
// =============================================================================
void accessDenied() {
  Serial.println("ACCESS DENIED");
  Serial.println("Unauthorized RFID Card!");
  Serial.println();

  // Red LED ON
  digitalWrite(RED_LED, HIGH);

  // Three short beeps (150ms on / 150ms off)
  for (int i = 0; i < 3; i++) {
    digitalWrite(BUZZER, HIGH);
    delay(150);
    digitalWrite(BUZZER, LOW);
    delay(150);
  }

  // Keep red LED ON
  delay(700);

  // Red LED OFF
  digitalWrite(RED_LED, LOW);
}
