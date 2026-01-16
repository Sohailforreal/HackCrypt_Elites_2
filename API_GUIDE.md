# API Testing Guide

## Using REST Clients

You can test the APIs using **Postman**, **Insomnia**, or **VS Code REST Client**.

### 1. Health Check

**Request:**
```http
GET http://localhost:5000/api/health
```

**Response:**
```json
{
  "status": "Server is running",
  "timestamp": "2024-01-16T10:30:00.000Z"
}
```

---

## Student Registration API

### Register a New Student

**Request:**
```http
POST http://localhost:5000/api/students/register
Content-Type: application/json

{
  "name": "John Doe",
  "studentId": "STU001",
  "class": "10",
  "division": "A",
  "gender": "Male"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Student registered successfully",
  "student": {
    "_id": "65a123456789abcdef123456",
    "name": "John Doe",
    "studentId": "STU001",
    "class": "10",
    "division": "A",
    "gender": "Male",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS..."
  }
}
```

**Response (Duplicate Student):**
```json
{
  "success": false,
  "message": "Student with this ID already exists"
}
```

**Response (Missing Fields):**
```json
{
  "success": false,
  "message": "All fields are required: name, studentId, class, division, gender"
}
```

---

### Get All Students

**Request:**
```http
GET http://localhost:5000/api/students/all
```

**Response:**
```json
{
  "success": true,
  "students": [
    {
      "_id": "65a123456789abcdef123456",
      "name": "John Doe",
      "studentId": "STU001",
      "class": "10",
      "division": "A",
      "gender": "Male",
      "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS...",
      "fingerprint": "abc123def456...",
      "faceDescriptor": [0.1, 0.2, 0.3, ...],
      "registeredAt": "2024-01-16T10:00:00.000Z"
    }
  ]
}
```

---

### Get Single Student

**Request:**
```http
GET http://localhost:5000/api/students/65a123456789abcdef123456
```

**Response:**
```json
{
  "success": true,
  "student": {
    "_id": "65a123456789abcdef123456",
    "name": "John Doe",
    "studentId": "STU001",
    ...
  }
}
```

---

### Store Biometric Data

**Request:**
```http
POST http://localhost:5000/api/students/biometric/65a123456789abcdef123456
Content-Type: application/json

{
  "fingerprintData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
  "faceImageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Biometric data stored successfully",
  "student": {
    "_id": "65a123456789abcdef123456",
    "name": "John Doe",
    "studentId": "STU001"
  }
}
```

---

## Attendance Verification API

### Mark Attendance (Verify Multi-Factor)

**Request:**
```http
POST http://localhost:5000/api/attendance/verify
Content-Type: application/json

{
  "studentId": "65a123456789abcdef123456",
  "qrCodeData": "{\"studentId\":\"STU001\",\"name\":\"John Doe\",\"class\":\"10\",\"division\":\"A\",\"uniqueId\":\"uuid\",\"timestamp\":\"2024-01-16T10:30:00Z\"}",
  "fingerprintData": "abc123fingerprint456def789...",
  "faceImageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
}
```

**Response (All Factors Verified - SUCCESS):**
```json
{
  "success": true,
  "message": "Attendance marked successfully - All factors verified",
  "attendance": {
    "_id": "65a987654321fedcba987654",
    "studentName": "John Doe",
    "studentId": "STU001",
    "date": "2024-01-16T10:30:45.000Z",
    "status": "Present",
    "verificationDetails": {
      "qrCode": true,
      "fingerprint": true,
      "face": true
    },
    "verifiedAt": "2024-01-16T10:30:45.000Z"
  }
}
```

**Response (Missing QR Code - FAILURE):**
```json
{
  "success": false,
  "message": "All three authentication methods are required: QR Code, Fingerprint, and Face Recognition",
  "missingFactors": {
    "qrCode": true,
    "fingerprint": false,
    "face": false
  }
}
```

**Response (Fingerprint Not Registered - FAILURE):**
```json
{
  "success": false,
  "message": "Student fingerprint not registered. Please register biometric data first."
}
```

**Response (Face Not Registered - FAILURE):**
```json
{
  "success": false,
  "message": "Student face data not registered. Please register biometric data first."
}
```

**Response (Verification Failed - FAILURE):**
```json
{
  "success": false,
  "message": "Attendance not marked - Authentication failed",
  "details": {
    "qrCode": true,
    "fingerprint": false,
    "face": true
  },
  "note": "All three factors (QR Code, Fingerprint, Face) must be verified"
}
```

**Response (Duplicate Attendance):**
```json
{
  "success": false,
  "message": "Attendance already marked for today"
}
```

---

### Get Student's Attendance Records

**Request:**
```http
GET http://localhost:5000/api/attendance/student/65a123456789abcdef123456
```

**Response:**
```json
{
  "success": true,
  "studentName": "John Doe",
  "attendance": [
    {
      "_id": "65a987654321fedcba987654",
      "studentId": "65a123456789abcdef123456",
      "date": "2024-01-16T10:30:45.000Z",
      "photoVerified": true,
      "fingerprintVerified": true,
      "qrcodeVerified": true,
      "status": "Present",
      "verifiedAt": "2024-01-16T10:30:45.000Z"
    },
    {
      "_id": "65a987654321fedcba987653",
      "studentId": "65a123456789abcdef123456",
      "date": "2024-01-15T09:15:30.000Z",
      "photoVerified": true,
      "fingerprintVerified": true,
      "qrcodeVerified": true,
      "status": "Present",
      "verifiedAt": "2024-01-15T09:15:30.000Z"
    }
  ]
}
```

---

### Get All Attendance Records (with filters)

**Request (All Records):**
```http
GET http://localhost:5000/api/attendance
```

**Request (With Filters):**
```http
GET http://localhost:5000/api/attendance?startDate=2024-01-01&endDate=2024-01-31&class=10&division=A
```

**Query Parameters:**
- `startDate` - Filter from date (ISO format: YYYY-MM-DD)
- `endDate` - Filter to date (ISO format: YYYY-MM-DD)
- `class` - Filter by class (10, 11, 12, B.Tech)
- `division` - Filter by division (A, B, C, D)

**Response:**
```json
{
  "success": true,
  "records": 15,
  "attendance": [
    {
      "_id": "65a987654321fedcba987654",
      "studentId": {
        "_id": "65a123456789abcdef123456",
        "name": "John Doe",
        "studentId": "STU001",
        "class": "10",
        "division": "A",
        "gender": "Male"
      },
      "date": "2024-01-16T10:30:45.000Z",
      "photoVerified": true,
      "fingerprintVerified": true,
      "qrcodeVerified": true,
      "status": "Present",
      "verifiedAt": "2024-01-16T10:30:45.000Z"
    }
  ]
}
```

---

## Testing Workflow

### Complete User Flow Test

1. **Register Student:**
   ```bash
   curl -X POST http://localhost:5000/api/students/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Student",
       "studentId": "TEST001",
       "class": "10",
       "division": "A",
       "gender": "Male"
     }'
   ```

2. **Store Biometric Data:**
   - Copy the student `_id` from registration response
   - Send biometric data with the student ID

3. **Verify Attendance:**
   - Use the student `_id` and captured biometric data
   - Ensure all three factors are provided
   - Check response for success

4. **View Records:**
   - Get attendance by student ID
   - Get all attendance with filters

---

## Error Codes & Meanings

| Code | Message | Cause |
|------|---------|-------|
| 201 | Success | Operation successful |
| 400 | Bad Request | Missing or invalid parameters |
| 401 | Unauthorized | Authentication failed |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate entry (e.g., student ID) |
| 500 | Server Error | Internal server error |

---

## Sample cURL Commands

### Register Student
```bash
curl -X POST http://localhost:5000/api/students/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "studentId": "STU002",
    "class": "11",
    "division": "B",
    "gender": "Female"
  }' | json_pp
```

### Get All Students
```bash
curl -X GET http://localhost:5000/api/students/all | json_pp
```

### Get Attendance Records (Class 10, Division A)
```bash
curl -X GET "http://localhost:5000/api/attendance?class=10&division=A" | json_pp
```

---

## Response Time Metrics

- Register Student: 50-200ms
- Get All Students: 30-100ms
- Mark Attendance: 100-500ms (includes verification)
- Get Records: 50-200ms

---

## Data Type Reference

### Date Format
All dates are in ISO 8601 format:
```
2024-01-16T10:30:45.000Z
```

### Image Data Format
Images are sent as Base64 data URLs:
```
data:image/jpeg;base64,/9j/4AAQSkZJRgABA...
```

### UUID Format
```
550e8400-e29b-41d4-a716-446655440000
```

---

## Rate Limiting (Future Enhancement)

Currently no rate limiting. Future versions may include:
- 100 requests per minute per IP
- 1000 requests per hour per API key

---

## Pagination (Future Enhancement)

Current responses return all records. Future enhancement:
```http
GET http://localhost:5000/api/attendance?page=1&limit=20
```

---

## Version Info

- API Version: 1.0.0
- Last Updated: January 2024
- Protocol: HTTP/REST
- Content-Type: application/json

---

For more details, refer to [SETUP_GUIDE.md](./SETUP_GUIDE.md)
