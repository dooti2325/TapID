#ifndef API_CLIENT_H
#define API_CLIENT_H

#include <Arduino.h>
#include <HTTPClient.h>
#include <WiFiClient.h>
#include <WiFiClientSecure.h>
#include "config.h"
#include "secrets.h"

enum AttendanceStatus {
    STATUS_SUCCESS,
    STATUS_WRONG_SECTION,
    STATUS_DUPLICATE,
    STATUS_PROXY_DETECTED,
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
    String studentSection;
    String expectedSection;
    int bulkAdded;
    int bulkErrors;
};

struct HeartbeatResponse {
    bool success;
    bool isOnline;
    bool hasActiveSession;
    int sessionId;
    String subjectName;
    String facultyName;
    String sectionName;
    int sectionId;
    String roomNumber;
};

class ApiClient {
public:
    ApiClient();

    void setBaseUrl(const String& baseUrl);
    String getBaseUrl() const;

    void setApiKey(const String& apiKey);
    String getApiKey() const;

    AttendanceResponse recordAttendance(const String& rfidUid, const String& macAddress, bool isProxy = false);
    AttendanceResponse bulkRecordAttendance(const String& macAddress, const String& recordsJsonArray);
    HeartbeatResponse sendHeartbeat(const String& macAddress);
    bool updateDeviceStatus(const String& macAddress, const String& status);
    bool checkHealth();

private:
    String _baseUrl;
    String _apiKey;

    AttendanceResponse parseResponse(int httpCode, const String& responseBody);
};

#endif // API_CLIENT_H
