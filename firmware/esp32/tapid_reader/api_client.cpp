#include "api_client.h"

ApiClient::ApiClient() : _baseUrl(API_BASE_URL), _apiKey(DEVICE_API_KEY) {}

void ApiClient::setBaseUrl(const String& baseUrl) {
    _baseUrl = baseUrl;
    if (_baseUrl.endsWith("/")) {
        _baseUrl.remove(_baseUrl.length() - 1);
    }
}

String ApiClient::getBaseUrl() const {
    return _baseUrl;
}

void ApiClient::setApiKey(const String& apiKey) {
    _apiKey = apiKey;
    _apiKey.trim();
}

String ApiClient::getApiKey() const {
    return _apiKey;
}

// Lightweight JSON helper to extract string value by key
static String extractJsonString(const String& json, const String& key) {
    String pattern = "\"" + key + "\":\"";
    int start = json.indexOf(pattern);
    if (start == -1) {
        pattern = "\"" + key + "\": \"";
        start = json.indexOf(pattern);
    }
    if (start == -1) return "";

    start += pattern.length();
    int end = json.indexOf("\"", start);
    if (end == -1) return "";

    return json.substring(start, end);
}

// Lightweight JSON helper to extract integer value by key
static int extractJsonInt(const String& json, const String& key) {
    String pattern = "\"" + key + "\":";
    int start = json.indexOf(pattern);
    if (start == -1) return 0;

    start += pattern.length();
    while (start < (int)json.length() && (json[start] == ' ' || json[start] == '\t')) {
        start++;
    }
    int end = start;
    while (end < (int)json.length() && (isdigit(json[end]) || json[end] == '-')) {
        end++;
    }
    if (start == end) return 0;
    return json.substring(start, end).toInt();
}

// Helper: Safely begin HTTP without placing heavy WiFiClientSecure on the stack
static bool beginConnection(HTTPClient& http, WiFiClient& client, WiFiClientSecure*& pSecure, const String& url) {
    if (url.startsWith("https://")) {
        pSecure = new WiFiClientSecure();
        if (pSecure) {
            pSecure->setInsecure();
            return http.begin(*pSecure, url);
        }
        return false;
    } else {
        return http.begin(client, url);
    }
}

// Helper: Safely clean up HTTP connection and any heap-allocated secure client
static void endConnection(HTTPClient& http, WiFiClientSecure*& pSecure) {
    http.end();
    if (pSecure) {
        delete pSecure;
        pSecure = nullptr;
    }
}

AttendanceResponse ApiClient::parseResponse(int httpCode, const String& responseBody) {
    AttendanceResponse res;
    res.httpCode = httpCode;
    res.message = extractJsonString(responseBody, "message");
    res.studentName = extractJsonString(responseBody, "student_name");
    res.studentSection = extractJsonString(responseBody, "student_section");
    res.expectedSection = extractJsonString(responseBody, "expected_section");
    res.bulkAdded = extractJsonInt(responseBody, "added");
    res.bulkErrors = extractJsonInt(responseBody, "errors");

    String statusStr = extractJsonString(responseBody, "status");

    if (httpCode >= 200 && httpCode < 300) {
        res.status = STATUS_SUCCESS;
    } else if (httpCode == 422 || statusStr == "wrong_section") {
        res.status = STATUS_WRONG_SECTION;
    } else if (httpCode == 429 || statusStr == "proxy_detected") {
        res.status = STATUS_PROXY_DETECTED;
    } else if (httpCode == 409 || statusStr == "duplicate") {
        res.status = STATUS_DUPLICATE;
    } else if (httpCode == 400 || statusStr == "no_session") {
        res.status = STATUS_NO_SESSION;
    } else if (httpCode == 403) {
        res.status = STATUS_DEVICE_INVALID;
    } else if (httpCode == 404) {
        res.status = STATUS_CARD_NOT_FOUND;
    } else if (httpCode <= 0) {
        res.status = STATUS_NETWORK_ERROR;
    } else {
        res.status = STATUS_SERVER_ERROR;
    }

    return res;
}

AttendanceResponse ApiClient::recordAttendance(const String& rfidUid, const String& macAddress, bool isProxy) {
    AttendanceResponse res;
    String endpoint = _baseUrl + ENDPOINT_ATTENDANCE_RECORD;

    HTTPClient http;
    WiFiClient client;
    WiFiClientSecure* pSecure = nullptr;

    if (!beginConnection(http, client, pSecure, endpoint)) {
        res.httpCode = -1;
        res.status = STATUS_NETWORK_ERROR;
        res.message = "Failed to initiate HTTP client";
        endConnection(http, pSecure);
        return res;
    }

    http.addHeader("Content-Type", "application/json");
    http.setTimeout(HTTP_TIMEOUT_MS);

    if (_apiKey.length() > 0) {
        http.addHeader("X-Device-Key", _apiKey);
    }

    String payload = "{\"rfid_uid\":\"" + rfidUid + "\",\"mac_address\":\"" + macAddress + "\"";
    if (isProxy) {
        payload += ",\"is_proxy\":true";
    }
    payload += "}";

    Serial.printf("[API] POST %s\n", endpoint.c_str());
    Serial.printf("[API] Payload: %s\n", payload.c_str());

    int httpCode = http.POST(payload);
    String responseBody = "";

    if (httpCode > 0) {
        responseBody = http.getString();
        Serial.printf("[API] Response Code %d: %s\n", httpCode, responseBody.c_str());
        res = parseResponse(httpCode, responseBody);
    } else {
        Serial.printf("[API] HTTP POST failed, error: %s\n", http.errorToString(httpCode).c_str());
        res.httpCode = httpCode;
        res.status = STATUS_NETWORK_ERROR;
        res.message = http.errorToString(httpCode);
    }

    endConnection(http, pSecure);
    return res;
}

AttendanceResponse ApiClient::bulkRecordAttendance(const String& macAddress, const String& recordsJsonArray) {
    AttendanceResponse res;
    String endpoint = _baseUrl + ENDPOINT_ATTENDANCE_BULK_RECORD;

    HTTPClient http;
    WiFiClient client;
    WiFiClientSecure* pSecure = nullptr;

    if (!beginConnection(http, client, pSecure, endpoint)) {
        res.httpCode = -1;
        res.status = STATUS_NETWORK_ERROR;
        res.message = "Failed to initiate bulk HTTP client";
        endConnection(http, pSecure);
        return res;
    }

    http.addHeader("Content-Type", "application/json");
    http.setTimeout(HTTP_TIMEOUT_MS * 2);

    if (_apiKey.length() > 0) {
        http.addHeader("X-Device-Key", _apiKey);
    }

    String payload = "{\"mac_address\":\"" + macAddress + "\",\"records\":" + recordsJsonArray + "}";

    Serial.printf("[API] Bulk POST %s\n", endpoint.c_str());
    int httpCode = http.POST(payload);
    String responseBody = "";

    if (httpCode > 0) {
        responseBody = http.getString();
        Serial.printf("[API] Bulk Response Code %d: %s\n", httpCode, responseBody.c_str());
        res = parseResponse(httpCode, responseBody);
    } else {
        Serial.printf("[API] Bulk POST failed: %s\n", http.errorToString(httpCode).c_str());
        res.httpCode = httpCode;
        res.status = STATUS_NETWORK_ERROR;
        res.message = http.errorToString(httpCode);
    }

    endConnection(http, pSecure);
    return res;
}

HeartbeatResponse ApiClient::sendHeartbeat(const String& macAddress) {
    HeartbeatResponse res;
    res.success = false;
    res.isOnline = false;
    res.hasActiveSession = false;
    res.sessionId = 0;
    res.sectionId = 0;

    String endpoint = _baseUrl + ENDPOINT_DEVICE_HEARTBEAT;

    HTTPClient http;
    WiFiClient client;
    WiFiClientSecure* pSecure = nullptr;

    if (!beginConnection(http, client, pSecure, endpoint)) {
        endConnection(http, pSecure);
        return res;
    }

    http.addHeader("Content-Type", "application/json");
    http.setTimeout(HTTP_TIMEOUT_MS);

    if (_apiKey.length() > 0) {
        http.addHeader("X-Device-Key", _apiKey);
    }

    String payload = "{\"mac_address\":\"" + macAddress + "\"}";
    int httpCode = http.POST(payload);

    if (httpCode >= 200 && httpCode < 300) {
        String body = http.getString();
        res.success = true;
        res.isOnline = (extractJsonString(body, "status") == "online");
        res.roomNumber = extractJsonString(body, "room_number");

        // Check if active_session is present
        if (body.indexOf("\"active_session\":null") == -1 && body.indexOf("\"active_session\": null") == -1) {
            res.hasActiveSession = true;
            res.sessionId = extractJsonInt(body, "session_id");
            res.subjectName = extractJsonString(body, "subject");
            res.facultyName = extractJsonString(body, "faculty");
            res.sectionName = extractJsonString(body, "section");
            res.sectionId = extractJsonInt(body, "section_id");
        }
    } else {
        Serial.printf("[API] Heartbeat failed (Code %d: %s)\n", httpCode, http.errorToString(httpCode).c_str());
    }

    endConnection(http, pSecure);
    return res;
}

bool ApiClient::updateDeviceStatus(const String& macAddress, const String& status) {
    String endpoint = _baseUrl + ENDPOINT_DEVICE_STATUS;

    HTTPClient http;
    WiFiClient client;
    WiFiClientSecure* pSecure = nullptr;

    if (!beginConnection(http, client, pSecure, endpoint)) {
        endConnection(http, pSecure);
        return false;
    }

    http.addHeader("Content-Type", "application/json");
    http.setTimeout(HTTP_TIMEOUT_MS);

    if (_apiKey.length() > 0) {
        http.addHeader("X-Device-Key", _apiKey);
    }

    String payload = "{\"mac_address\":\"" + macAddress + "\",\"status\":\"" + status + "\"}";
    int httpCode = http.POST(payload);
    bool ok = (httpCode >= 200 && httpCode < 300);

    endConnection(http, pSecure);
    return ok;
}

bool ApiClient::checkHealth() {
    String endpoint = _baseUrl + "/health";

    HTTPClient http;
    WiFiClient client;
    WiFiClientSecure* pSecure = nullptr;

    if (!beginConnection(http, client, pSecure, endpoint)) {
        endConnection(http, pSecure);
        return false;
    }

    http.setTimeout(HTTP_TIMEOUT_MS);
    int code = http.GET();
    bool ok = (code == 200);

    endConnection(http, pSecure);
    return ok;
}
