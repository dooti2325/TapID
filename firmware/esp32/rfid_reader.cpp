#include "rfid_reader.h"

RfidReader::RfidReader(uint8_t ssPin, uint8_t rstPin)
    : _mfrc522(ssPin, rstPin),
      _lastScannedUid(""),
      _lastScanTime(0),
      _debouncePeriodMs(CARD_DEBOUNCE_MS) {}

bool RfidReader::init() {
    SPI.begin();
    _mfrc522.PCD_Init();
    delay(50);

    // Increase antenna gain to maximum for optimal reading range
    _mfrc522.PCD_SetAntennaGain(MFRC522::RxGain_max);

    byte version = _mfrc522.PCD_ReadRegister(MFRC522::VersionReg);
    Serial.printf("[RFID] MFRC522 Reader Firmware Version: 0x%02X\n", version);

    if (version == 0x00 || version == 0xFF) {
        Serial.println("[RFID] WARNING: Communication with MFRC522 failed. Check SPI wiring.");
        return false;
    }

    Serial.println("[RFID] MFRC522 initialized and ready.");
    return true;
}

bool RfidReader::isCardPresent() {
    if (!_mfrc522.PICC_IsNewCardPresent()) {
        return false;
    }
    if (!_mfrc522.PICC_ReadCardSerial()) {
        return false;
    }
    return true;
}

String RfidReader::formatUidHex(const MFRC522::Uid& uid) {
    String hexStr = "";
    for (byte i = 0; i < uid.size; i++) {
        if (uid.uidByte[i] < 0x10) {
            hexStr += "0";
        }
        hexStr += String(uid.uidByte[i], HEX);
    }
    hexStr.toUpperCase();
    return hexStr;
}

String RfidReader::readCardUID() {
    String uid = formatUidHex(_mfrc522.uid);
    return uid;
}

bool RfidReader::isDebounced(const String& uid) {
    unsigned long now = millis();
    if (uid.equalsIgnoreCase(_lastScannedUid) && (now - _lastScanTime < _debouncePeriodMs)) {
        return false; // Still within cooldown
    }

    _lastScannedUid = uid;
    _lastScanTime = now;
    return true;
}

void RfidReader::halt() {
    _mfrc522.PICC_HaltA();
    _mfrc522.PCD_StopCrypto1();
}

bool RfidReader::performSelfTest() {
    return _mfrc522.PCD_PerformSelfTest();
}
