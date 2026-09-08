#include "api_client.h"

ApiClient::ApiClient() : _baseUrl(API_BASE_URL) {}

void ApiClient::setBaseUrl(const String& baseUrl) {
    _baseUrl = baseUrl;
    if (_baseUrl.endsWith("/")) {
        _baseUrl.remove(_baseUrl.length() - 1);
    }
}

String ApiClient::getBaseUrl() const {
    return _baseUrl;
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

AttendanceResponse ApiClient::parseResponse(int httpCode, const String& responseBody) {
    AttendanceResponse res;
    res.httpCode = httpCode;
    res.message = extractJsonString(responseBody, "message");
    res.studentName = extractJsonString(responseBody, "student_name");
    res.bulkAdded = extractJsonInt(responseBody, "added");
    res.bulkErrors = extractJsonInt(responseBody, "errors");

    if (httpCode >= 200 && httpCode < 300) {
        res.status = STATUS_SUCCESS;
    } else if (httpCode == 409) {
        res.status = STATUS_DUPLICATE;
    } else if (httpCode == 400) {
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

AttendanceResponse ApiClient::recordAttendance(const String& rfidUid, const String& macAddress) {
    AttendanceResponse res;
    String endpoint = _baseUrl + ENDPOINT_ATTENDANCE_RECORD;

    _http.begin(_wifiClient, endpoint);
    _http.addHeader("Content-Type", "application/json");
    _http.setTimeout(HTTP_TIMEOUT_MS);

    String apiKey = String(DEVICE_API_KEY);
    apiKey.trim();
    if (apiKey.length() > 0) {
        _http.addHeader("X-Device-Key", apiKey);
    }

    String payload = "{\"rfid_uid\":\"" + rfidUid + "\",\"mac_address\":\"" + macAddress + "\"}";

    Serial.printf("[API] POST %s\n", endpoint.c_str());
    Serial.printf("[API] Payload: %s\n", payload.c_str());

    int httpCode = _http.POST(payload);
    String responseBody = "";

    if (httpCode > 0) {
        responseBody = _http.getString();
        Serial.printf("[API] Response Code %d: %s\n", httpCode, responseBody.c_str());
        res = parseResponse(httpCode, responseBody);
    } else {
        Serial.printf("[API] HTTP POST failed, error: %s\n", _http.errorToString(httpCode).c_str());
        res.httpCode = httpCode;
        res.status = STATUS_NETWORK_ERROR;
        res.message = _http.errorToString(httpCode);
    }

    _http.end();
    return res;
}

AttendanceResponse ApiClient::bulkRecordAttendance(const String& macAddress, const String& recordsJsonArray) {
    AttendanceResponse res;
    String endpoint = _baseUrl + ENDPOINT_ATTENDANCE_BULK_RECORD;

    _http.begin(_wifiClient, endpoint);
    _http.addHeader("Content-Type", "application/json");
    _http.setTimeout(HTTP_TIMEOUT_MS * 2);

    String apiKey = String(DEVICE_API_KEY);
    apiKey.trim();
    if (apiKey.length() > 0) {
        _http.addHeader("X-Device-Key", apiKey);
    }

    String payload = "{\"mac_address\":\"" + macAddress + "\",\"records\":" + recordsJsonArray + "}";

    Serial.printf("[API] Bulk POST %s\n", endpoint.c_str());
    Serial.printf("[API] Bulk Payload: %s\n", payload.c_str());

    int httpCode = _http.POST(payload);
    String responseBody = "";

    if (httpCode > 0) {
        responseBody = _http.getString();
        Serial.printf("[API] Bulk Response Code %d: %s\n", httpCode, responseBody.c_str());
        res = parseResponse(httpCode, responseBody);
    } else {
        Serial.printf("[API] Bulk POST failed, error: %s\n", _http.errorToString(httpCode).c_str());
        res.httpCode = httpCode;
        res.status = STATUS_NETWORK_ERROR;
        res.message = _http.errorToString(httpCode);
    }

    _http.end();
    return res;
}

bool ApiClient::checkHealth() {
    String endpoint = _baseUrl + "/health";
    _http.begin(_wifiClient, endpoint);
    _http.setTimeout(HTTP_TIMEOUT_MS);

    int code = _http.GET();
    bool ok = (code == 200);
    _http.end();
    return ok;
}
