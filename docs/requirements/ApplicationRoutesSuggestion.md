# API Route Overview

This document provides a possible structured overview of all backend routes required by the frontend.

It describes for each route:

* route path
* HTTP method
* purpose
* accepted parameters
* parameter source
* whether parameters are required or optional
* expected parameter types
* response shape
* possible status codes and errors

* Possible Status Codes:
    - `200 OK`                      Request successful
    - `201 Created`                 Resource created
    - `204 No Content`              Request successful, no Response body
    - `400 Bad Request`             invalid input
    - `401 Unauthorized`            Missing or Invalid Authentication
    - `403 Forbidden`               Authenticated but insufficient permissions
    - `404 Not Found`               Resource does not exist
    - `409 Conflict`                Conflicting state or duplicate resource
    - `429 Too Many Requests`       usage limit or rate limit exceeded
    - `500 Internal Server Error`   Server Error

## 1. Authentication

### GET /api/auth/me
**Purpose:**
Returns the currently authenticated user including the role

**Inputs:** 
- Authorization (header, required, bearer token)

**Output**
- `200 OK`
```json
{
  "id": "usr_123",
  "displayName": "Max Mustermann",
  "email": "max.mustermann@schule.at",
  "role": "student",
  "classIds": ["3AHITM"],
  "permissions": [
    "tutors.read",
    "chats.create"
  ]
}
```

**Errors**
- `401 Unauthorized`
- `500 Internal Server Error`
---

### POST /api/auth/logout
**Purpose** 
Logs the current user out

**Inputs**
- `Authorization` (header, required, bearer token)

**Output**
- `204 No Content`

**Errors**
- `401 Unauthorized`
- `500 Internal Server Error`

## 2. Tutors / Workspaces
### GET /api/tutors

**Purpose** 
Returns all visible tutors, students only see tutors assigned to their own class.

**Inputs**
- `Authorization` (header, required, bearer token)
- `classId` (query param, optional, string)
- `subject` (query param, optional, string)
- `activeOnly` (query param, optional, boolean)

**Output**
- `200 OK`
```json
{
  "items": [
    {
      "id": "tutor_001",
      "name": "Mathematics Tutor",
      "description": "Helps with analysis and equations",
      "subject": "Mathematics",
      "isActive": true,
      "ownerId": "usr_teacher_1",
      "allowedClassIds": ["3AHITM", "3BHITM"],
      "model": "gpt-4o-mini"
    }
  ]
}
```

**Errors**
- `401 Unauthorized`
- `403 Forbidden`
---

### GET /api/tutors/:tutorId

**Purpose**  
Returns the details of a single tutor.

**Inputs**
- `tutorId` (path param, required, string)
- `Authorization` (header, required, bearer token)

**Output**
- `200 OK`
```json
{
  "id": "tutor_001",
  "name": "Mathematics Tutor",
  "description": "Helps with analysis and equations",
  "subject": "Mathematics",
  "systemPrompt": "You are a didactic mathematics tutor...",
  "model": "gpt-4o-mini",
  "isActive": true,
  "allowedClassIds": ["3AHITM"]
}
```

**Errors**
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
---

### POST /api/tutors
**Purpose**
Creates a new Tutor or workspace configuration

**Inputs**
- `Authorization` (header, required, bearer token)
- auth context with role `teacher` or `admin`
- request body:
  - `name` (required, string, max 100)
  - `description` (optional, string, max 500)
  - `subject` (required, string)
  - `systemPrompt` (required, string)
  - `model` (required, string)
  - `allowedClassIds` (optional, string[])
  - `isActive` (optional, boolean)

**Output**
- `201 Created`
```json
{
  "id": "tutor_002",
  "name": "German Tutor",
  "description": "Supports text analysis",
  "subject": "German",
  "systemPrompt": "You are a German tutor...",
  "model": "gpt-4o-mini",
  "allowedClassIds": ["2AHITM"],
  "isActive": true
}
```

**Errors**
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`

---

### PUT /api/tutors/:tutorId 
**Purpose**  
Updates an existing Tutor

**Inputs**
- `tutorId` (path param, required, string)
- `Authorization` (header, required, bearer token)
- auth context with role `teacher` or `admin`
- request body:
  - `name` (optional, string)
  - `description` (optional, string)
  - `subject` (optional, string)
  - `systemPrompt` (optional, string)
  - `model` (optional, string)
  - `allowedClassIds` (optional, string[])
  - `isActive` (optional, boolean)

**Output**
- `200 OK`
```json
{
  "id": "tutor_002",
  "name": "German Tutor",
  "description": "Updated description",
  "subject": "German",
  "systemPrompt": "You are a didactic German tutor...",
  "model": "gpt-4o-mini",
  "allowedClassIds": ["2AHITM"],
  "isActive": true
}
```

**Errors**
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`

---

### DELETE /api/tutors/:tutorId
**Purpose**  
Deletes a tutor.

**Inputs**
- `tutorId` (path param, required, string)
- `Authorization` (header, required, bearer token)
- auth context with role `teacher` or `admin`

**Output**
- `204 No Content`

**Errors**
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
---

### PUT /api/tutors/:tutorId/visibility
**Purpose**
Updates which classes may use a tutor.

**Inputs**
- `tutorId` (path param, required, string)
- `Authorization` (header, required, bearer token)
- auth context with role `teacher` or `admin`
- request body:
  - `allowedClassIds` (required, string[])

**Output**
- `200 OK`
```json
{
  "id": "tutor_001",
  "allowedClassIds": ["3AHITM", "3BHITM"]
}
```

**Errors**
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`

---

## 3. Chat / Tutor Interaction
### POST /api/chats
**Purpose**
Creates a new chat session for a selected tutor.  

**Inputs**
- Authorization (header, required, bearer token)
- body:
  - tutorId (required, string)

**Output**
- 201 Created
```json
{
  "id": "chat_123",
  "tutorId": "tutor_001",
  "createdAt": "2026-04-27T10:00:00Z"
}
```

**Errors**
---

### GET /api/chats
**Purpose**
Returns all chat sessions of the authenticated user.  

**Inputs**
- Authorization (header, required, bearer token)

**Output**
- 200 OK
```json
{
  "items": [
    {
      "id": "chat_123",
      "tutorId": "tutor_001",
      "lastMessageAt": "2026-04-27T10:00:00Z"
    }
  ]
}
```

**Errors**
- `401 Unauthorized`
- `404 Not Found`
- `403 Forbidden`

---

### GET /api/chats/:chatId
**Purpose**  
Returns a single chat with its message history.
**Inputs**
- chatId (path param, required, string)
- Authorization (header, required, bearer token)

**Output**
- 200 OK
```json
{
  "id": "chat_123",
  "tutorId": "tutor_001",
  "messages": [
    {
      "role": "user",
      "content": "Hello",
      "createdAt": "2026-04-27T10:00:00Z"
    }
  ]
}
```

**Errors**
- `401 Unauthorized`
- `404 Not Found`
---

### POST /api/chats/:chatId/messages
**Purpose**
Adds a new message to a chat and returns the AI response.  

**Inputs**
- chatId (path param, required, string)
- Authorization (header, required, bearer token)
- body:
  - message (required, string)

**Output**
- 200 OK
```json
{
  "userMessage": {
    "role": "user",
    "content": "Hello"
  },
  "assistantMessage": {
    "role": "assistant",
    "content": "Hi!"
  }
}
```
**Errors**
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
---

## 4. Usage / Budgets
### GET /api/me/usage
**Purpose**  
**Inputs**
- Authorization (header, required, bearer token)

**Output**
- 200 OK
```json
{
  "userId": "usr_123",
  "messagesUsed": 120,
  "messagesLimit": 1000,
  "cost": 4.20
}
```
**Errors**
- `401 Unauthorized`
---

### GET /api/classes/:classId/usage
**Purpose**

**Inputs**
- classId (path param, required, string)
- Authorization (header, required, bearer token)

**Output**
- 200 OK
```json
{
  "classId": "3AHITM",
  "totalMessages": 5000,
  "totalCost": 120.50
}
```

**Errors**
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
---

### PUT /api/users/:userId/budget
**Purpose**

**Inputs**
- userId (path param, required, string)
- Authorization (header, required, bearer token)
- body:
  - budgetLimit (required, number)

**Output**
- 200 OK
```json
{
  "userId": "usr_123",
  "budgetLimit": 1000
}
```

**Errors**
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
---

## 5. Teacher / Class Management
### GET /api/classes
**Purpose**  
**Inputs**
**Output**
**Errors**
---

### GET /api/classes/:classId/students
**Purpose**  
**Inputs**
**Output**
**Errors**
---

## 6. Admin / System Overview
### GET /api/admin/dashboard/usage
**Purpose**  
**Inputs**
**Output**
**Errors**
---

## 7. Other Routes after finishing backend