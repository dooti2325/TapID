#ifndef RFID_READER_H
#define RFID_READER_H

#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>
#include "config.h"

class RfidReader {
public:
    RfidReader(uint8_t ssPin, uint8_t rstPin);

    bool init();
    bool isCardPresent();
    String readCardUID();
    bool isDebounced(const String& uid);
    void halt();
    bool performSelfTest();

private:
    MFRC522 _mfrc522;
    String _lastScannedUid;
    unsigned long _lastScanTime;
    unsigned long _debouncePeriodMs;

    String formatUidHex(const MFRC522::Uid& uid);
};

#endif // RFID_READER_H
