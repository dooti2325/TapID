#ifndef API_CLIENT_H
#define API_CLIENT_H

#include <Arduino.h>
#include <HTTPClient.h>
#include <WiFiClient.h>
#include "config.h"
#include "secrets.h"

enum AttendanceStatus {
    STATUS_SUCCESS,
    STATUS_DUPLICATE,
    STATUS_NO_SESSION,
    STATUS_DEVICE_INVALID,
    STATUS_CARD_NOT_FOUND,
    STATUS_NETWORK_ERROR,
    STATUS_SERVER_ERROR
};

struct AttendanceResponse {
    AttendanceStatus status;
    int httpCode;
    String message;
    String studentName;
    int bulkAdded;
    int bulkErrors;
};

class ApiClient {
public:
    ApiClient();

    void setBaseUrl(const String& baseUrl);
    String getBaseUrl() const;

    AttendanceResponse recordAttendance(const String& rfidUid, const String& macAddress);
    AttendanceResponse bulkRecordAttendance(const String& macAddress, const String& recordsJsonArray);
    bool checkHealth();

private:
    String _baseUrl;
    HTTPClient _http;
    WiFiClient _wifiClient;

    AttendanceResponse parseResponse(int httpCode, const String& responseBody);
};

#endif // API_CLIENT_H
