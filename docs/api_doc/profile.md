# Profile API Documentation

Base URL: `/api/v1/profile`

## Overview

The Profile API allows authenticated users to view and update their own profile information, including personal details and social media links. All endpoints require authentication via session cookies.

## Authentication

All profile endpoints require authentication. Users can only access and modify their own profile data.

**Authentication Method:** Session-based (Better-Auth)

**Required Headers:**

- `Cookie`: Session cookie from authentication

**Unauthorized Response (401):**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "statusCode": 401
  },
  "meta": {
    "timestamp": "2024-01-20T10:30:00.000Z",
    "requestId": "abc-123-def-456",
    "path": "/api/v1/profile/me"
  }
}
```

---

## Endpoints

### Get Current User Profile

Retrieves the authenticated user's complete profile information including social media links.

**Endpoint:** `GET /api/v1/profile/me`

**Authentication:** Required

**Query Parameters:** None

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": "user_abc123xyz",
    "firstName": "John",
    "lastName": "Doe",
    "headshotUrl": "https://example.com/avatars/john-doe.jpg",
    "role": "USER",
    "phoneNumber": "+1234567890",
    "email": "john.doe@example.com",
    "userName": "John Doe",
    "userImage": "https://example.com/images/john.jpg",
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-01-20T10:30:00.000Z",
    "socials": [
      {
        "socialId": 1,
        "handle": "@johndoe",
        "fullUrl": "https://twitter.com/johndoe",
        "socialTitle": "Twitter",
        "socialIconUrl": "https://example.com/icons/twitter.svg",
        "socialBaseUrl": "https://twitter.com/"
      },
      {
        "socialId": 2,
        "handle": "john-doe",
        "fullUrl": "https://linkedin.com/in/john-doe",
        "socialTitle": "LinkedIn",
        "socialIconUrl": "https://example.com/icons/linkedin.svg",
        "socialBaseUrl": "https://linkedin.com/in/"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-20T10:30:00.000Z",
    "requestId": "abc-123-def-456"
  }
}
```

**Response Fields:**

| Field         | Type             | Description                                          |
| ------------- | ---------------- | ---------------------------------------------------- |
| `id`          | `number`         | Profile ID                                           |
| `userId`      | `string`         | User authentication ID                               |
| `firstName`   | `string \| null` | User's first name                                    |
| `lastName`    | `string \| null` | User's last name                                     |
| `headshotUrl` | `string \| null` | URL to profile photo                                 |
| `role`        | `enum`           | User role: `ADMIN`, `BLOGGER`, or `USER` (read-only) |
| `phoneNumber` | `string \| null` | User's phone number in E.164 format                  |
| `email`       | `string`         | User's email address                                 |
| `userName`    | `string`         | Full name from auth system                           |
| `userImage`   | `string \| null` | Avatar URL from auth provider                        |
| `createdAt`   | `string`         | ISO 8601 timestamp of profile creation               |
| `updatedAt`   | `string`         | ISO 8601 timestamp of last update                    |
| `socials`     | `array`          | Array of social media links                          |

**Social Link Object:**

| Field           | Type             | Description                                   |
| --------------- | ---------------- | --------------------------------------------- |
| `socialId`      | `number`         | ID of the social media platform               |
| `handle`        | `string \| null` | Username/handle on the platform               |
| `fullUrl`       | `string \| null` | Complete URL to the user's profile            |
| `socialTitle`   | `string`         | Name of the social platform (e.g., "Twitter") |
| `socialIconUrl` | `string \| null` | URL to platform's icon                        |
| `socialBaseUrl` | `string`         | Base URL of the platform                      |

**Error Responses:**

- `401 Unauthorized`: User is not authenticated
- `404 Not Found`: Profile not found (should auto-create on first access)
- `500 Internal Server Error`: Server error

---

### Update Current User Profile

Updates the authenticated user's profile information. All fields are optional. If `socials` array is provided, it replaces all existing social links (add, update, or remove).

**Endpoint:** `PATCH /api/v1/profile/me`

**Authentication:** Required

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phoneNumber": "+1987654321",
  "headshotUrl": "https://example.com/avatars/jane-smith.jpg",
  "socials": [
    {
      "socialId": 1,
      "handle": "@janesmith",
      "fullUrl": "https://twitter.com/janesmith"
    },
    {
      "socialId": 3,
      "handle": "jane.smith",
      "fullUrl": "https://github.com/jane.smith"
    }
  ]
}
```

**Request Body Schema:**

All fields are optional. Only include fields you want to update.

| Field         | Type             | Required | Validation                         | Description          |
| ------------- | ---------------- | -------- | ---------------------------------- | -------------------- |
| `firstName`   | `string`         | No       | 1-100 characters                   | User's first name    |
| `lastName`    | `string`         | No       | 1-100 characters                   | User's last name     |
| `phoneNumber` | `string \| null` | No       | E.164 format: `^\+?[1-9]\d{1,14}$` | User's phone number  |
| `headshotUrl` | `string \| null` | No       | Valid URL                          | URL to profile photo |
| `socials`     | `array`          | No       | Array of social objects            | Social media links   |

**Social Link Schema:**

| Field      | Type             | Required | Validation       | Description               |
| ---------- | ---------------- | -------- | ---------------- | ------------------------- |
| `socialId` | `number`         | Yes      | Positive integer | ID of the social platform |
| `handle`   | `string \| null` | No       | 1-255 characters | Username/handle           |
| `fullUrl`  | `string \| null` | No       | Valid URL        | Complete profile URL      |

**Important Notes:**

- **Role is immutable**: Users cannot update their `role` field via this API
- **Social links replacement**: If `socials` array is provided, it completely replaces existing links:
  - New social links are added
  - Existing social links not in the array are removed
  - Existing social links in the array are updated
- **Partial updates**: Only include fields you want to change
- **Null values**: Set a field to `null` to clear it

**Success Response (200):**

Returns the complete updated profile (same structure as GET endpoint):

```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": "user_abc123xyz",
    "firstName": "Jane",
    "lastName": "Smith",
    "headshotUrl": "https://example.com/avatars/jane-smith.jpg",
    "role": "USER",
    "phoneNumber": "+1987654321",
    "email": "jane.smith@example.com",
    "userName": "Jane Smith",
    "userImage": "https://example.com/images/jane.jpg",
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-01-20T14:30:00.000Z",
    "socials": [
      {
        "socialId": 1,
        "handle": "@janesmith",
        "fullUrl": "https://twitter.com/janesmith",
        "socialTitle": "Twitter",
        "socialIconUrl": "https://example.com/icons/twitter.svg",
        "socialBaseUrl": "https://twitter.com/"
      },
      {
        "socialId": 3,
        "handle": "jane.smith",
        "fullUrl": "https://github.com/jane.smith",
        "socialTitle": "GitHub",
        "socialIconUrl": "https://example.com/icons/github.svg",
        "socialBaseUrl": "https://github.com/"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-20T14:30:00.000Z",
    "requestId": "xyz-789-abc-123"
  }
}
```

**Error Responses:**

**400 Bad Request - Validation Error:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "statusCode": 400,
    "details": [
      {
        "field": "phoneNumber",
        "message": "Invalid phone number format",
        "value": null
      },
      {
        "field": "headshotUrl",
        "message": "Invalid URL format",
        "value": null
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-20T14:30:00.000Z",
    "requestId": "xyz-789-abc-123",
    "path": "/api/v1/profile/me"
  }
}
```

**401 Unauthorized:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "statusCode": 401
  },
  "meta": {
    "timestamp": "2024-01-20T14:30:00.000Z",
    "requestId": "xyz-789-abc-123",
    "path": "/api/v1/profile/me"
  }
}
```

**404 Not Found:**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Profile not found after update",
    "statusCode": 404
  },
  "meta": {
    "timestamp": "2024-01-20T14:30:00.000Z",
    "requestId": "xyz-789-abc-123",
    "path": "/api/v1/profile/me"
  }
}
```

---

## Usage Examples

### Example 1: Get Current Profile

**cURL:**

```bash
curl -X GET 'https://api.example.com/api/v1/profile/me' \
  -H 'Cookie: session=your-session-cookie' \
  -H 'Content-Type: application/json'
```

**JavaScript (Fetch API):**

```javascript
const response = await fetch("/api/v1/profile/me", {
  method: "GET",
  credentials: "include", // Important for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

const data = await response.json();
if (data.success) {
  console.log("Profile:", data.data);
} else {
  console.error("Error:", data.error);
}
```

**TypeScript (with types):**

```typescript
import type { ApiSuccessResponse } from "@suba-platform/types/api";
import type { ProfileResponse } from "../types/profile";

const response = await fetch("/api/v1/profile/me", {
  credentials: "include",
});

const data: ApiSuccessResponse<ProfileResponse> = await response.json();
console.log(data.data.firstName); // Type-safe
```

---

### Example 2: Update Profile with Basic Info

**cURL:**

```bash
curl -X PATCH 'https://api.example.com/api/v1/profile/me' \
  -H 'Cookie: session=your-session-cookie' \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "phoneNumber": "+1234567890"
  }'
```

**JavaScript:**

```javascript
const response = await fetch("/api/v1/profile/me", {
  method: "PATCH",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    firstName: "Jane",
    lastName: "Doe",
    phoneNumber: "+1234567890",
  }),
});

const data = await response.json();
```

---

### Example 3: Update Profile with Social Links

**cURL:**

```bash
curl -X PATCH 'https://api.example.com/api/v1/profile/me' \
  -H 'Cookie: session=your-session-cookie' \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "John",
    "socials": [
      {
        "socialId": 1,
        "handle": "@johndoe",
        "fullUrl": "https://twitter.com/johndoe"
      },
      {
        "socialId": 2,
        "handle": "john-doe",
        "fullUrl": "https://linkedin.com/in/john-doe"
      }
    ]
  }'
```

**JavaScript:**

```javascript
const updateProfile = async (profileData) => {
  try {
    const response = await fetch("/api/v1/profile/me", {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    console.error("Failed to update profile:", error);
    throw error;
  }
};

// Usage
await updateProfile({
  firstName: "John",
  socials: [
    { socialId: 1, handle: "@johndoe", fullUrl: "https://twitter.com/johndoe" },
    {
      socialId: 2,
      handle: "john-doe",
      fullUrl: "https://linkedin.com/in/john-doe",
    },
  ],
});
```

---

### Example 4: Remove All Social Links

To remove all social links, pass an empty array:

```javascript
await fetch("/api/v1/profile/me", {
  method: "PATCH",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    socials: [],
  }),
});
```

---

### Example 5: Clear a Field

To clear a nullable field, set it to `null`:

```javascript
await fetch("/api/v1/profile/me", {
  method: "PATCH",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    phoneNumber: null,
    headshotUrl: null,
  }),
});
```

---

## Validation Rules

### Phone Number

- **Format:** E.164 international format
- **Pattern:** `^\+?[1-9]\d{1,14}$`
- **Examples:**
  - ✅ `+1234567890`
  - ✅ `+441234567890`
  - ✅ `1234567890`
  - ❌ `123` (too short)
  - ❌ `+0123456789` (starts with 0)
  - ❌ `abc123` (contains letters)

### URLs (headshotUrl, fullUrl)

- **Format:** Valid HTTP/HTTPS URL
- **Examples:**
  - ✅ `https://example.com/image.jpg`
  - ✅ `http://cdn.example.com/avatar.png`
  - ❌ `not-a-url`
  - ❌ `example.com` (missing protocol)

### Name Fields (firstName, lastName)

- **Min Length:** 1 character
- **Max Length:** 100 characters
- Cannot be empty string

### Social Handle

- **Min Length:** 1 character
- **Max Length:** 255 characters

---

## Common Social Platform IDs

To get the list of available social platforms, query the `socials` table or check with your backend administrator. Common platforms include:

| ID  | Platform  | Base URL                   |
| --- | --------- | -------------------------- |
| 1   | Twitter   | `https://twitter.com/`     |
| 2   | LinkedIn  | `https://linkedin.com/in/` |
| 3   | GitHub    | `https://github.com/`      |
| 4   | Instagram | `https://instagram.com/`   |
| 5   | Facebook  | `https://facebook.com/`    |

_Note: Actual IDs may vary based on your database configuration._

---

## Security Considerations

1. **Authentication Required**: All endpoints require valid session authentication
2. **Self-Service Only**: Users can only view and edit their own profiles
3. **Role Immutability**: User roles cannot be changed via this API (admin-only operation)
4. **Input Validation**: All inputs are validated on the server side
5. **XSS Protection**: URLs and text inputs are sanitized
6. **Rate Limiting**: Consider implementing rate limiting for update operations

---

## Best Practices

1. **Use Partial Updates**: Only send fields you want to change
2. **Handle Errors Gracefully**: Check `success` field and handle validation errors
3. **Show Validation Feedback**: Use `error.details` array to display field-level errors
4. **Optimistic UI Updates**: Update UI immediately, rollback on error
5. **Request ID Tracking**: Use `meta.requestId` for debugging and support
6. **Cache Profile Data**: Cache profile data and invalidate on updates

---

## Rate Limits

_To be defined based on your production requirements_

Recommended:

- GET `/me`: 100 requests per minute per user
- PATCH `/me`: 10 requests per minute per user

---

## Changelog

### v1.1.0 (2024-01-20)

- Added social links support
- Added `socials` array to profile response
- Added `socials` field to update request

### v1.0.0 (2024-01-15)

- Initial release
- GET and PATCH endpoints for user profiles
- Basic profile fields (name, phone, photo)

Case study api

     const formData = new FormData();

     // Required
     formData.append("title", "My Case Study");

     // Numbers - send as string (or omit if not needed)
     formData.append("clientId", "123");      // string number, not null
     formData.append("serviceId", "456");     // string number, not null

     // Optional text fields
     formData.append("slug", "my-case-study");
     formData.append("excerpt", "Brief excerpt");
     formData.append("overview", "Full overview");
     formData.append("projectScope", "Scope details");
     formData.append("impact", "Impact details");
     formData.append("problem", "Problem statement");
     formData.append("process", "Process description");
     formData.append("deliverable", "What was delivered");

     // Tags - send as JSON string
     formData.append("tagIds", JSON.stringify([1, 2, 3]));

     // Images metadata - send as JSON string (NOT Blob)
     formData.append("imagesMeta", JSON.stringify([
       { position: 0, caption: "First image" },
       { position: 1, caption: "Second image" }
     ]));

     // Image files - key must be images[index]
     formData.append("images[0]", fileObject1);  // File from input
     formData.append("images[1]", fileObject2);  // File from input

     // Send it
     fetch("http://localhost:3000/api/v1/case-studies", {
       method: "POST",
       body: formData
     });
