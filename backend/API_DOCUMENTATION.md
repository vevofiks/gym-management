# Gym Management SaaS - API Documentation

Complete API reference with examples for all endpoints.

**Base URL**: `http://localhost:8000`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Admin Endpoints](#admin-endpoints)
3. [User Endpoints](#user-endpoints)
4. [Tenant Endpoints](#tenant-endpoints)
5. [Member Endpoints](#member-endpoints)
6. [Health Check](#health-check)

---

## Authentication

### 1. Login

**Endpoint**: `POST /auth/login`  
**Access**: Public  
**Description**: Authenticate user and receive JWT token

**Request Body** (form-data):

```
username: johndoe
password: SecurePass123!
```

**Response** (200 OK):

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Error Response** (401 Unauthorized):

```json
{
  "detail": "Incorrect username or password"
}
```

---

### 2. Change Password

**Endpoint**: `POST /auth/change-password`  
**Access**: Authenticated  
**Description**: Change password for authenticated user

**Headers**:

```
Authorization: Bearer <access_token>
```

**Request Body**:

```json
{
  "old_password": "SecurePass123!",
  "new_password": "NewSecurePass456!"
}
```

**Response** (200 OK):

```json
{
  "message": "Password changed successfully"
}
```

**Error Response** (400 Bad Request):

```json
{
  "detail": "Incorrect old password or user not found"
}
```

---

## Admin Endpoints

> **Note**: All admin endpoints require Superadmin role

### Tenant Management

#### 1. List All Tenants

**Endpoint**: `GET /admin/tenants`  
**Access**: Superadmin only

**Query Parameters**:

- `page` (optional, default: 1): Page number
- `page_size` (optional, default: 50): Items per page
- `search` (optional): Search by tenant name
- `active_only` (optional, default: true): Filter active tenants

**Example Request**:

```
GET /admin/tenants?page=1&page_size=10&search=Gold
Authorization: Bearer <superadmin_token>
```

**Response** (200 OK):

```json
{
  "tenants": [
    {
      "id": 1,
      "name": "Gold's Gym Downtown",
      "is_active": true,
      "paid_until": "2026-12-31",
      "upi_id": "goldsgym@paytm"
    },
    {
      "id": 2,
      "name": "Gold's Gym Uptown",
      "is_active": true,
      "paid_until": "2026-06-30",
      "upi_id": null
    }
  ],
  "total": 2,
  "page": 1,
  "page_size": 10,
  "total_pages": 1
}
```

---

#### 2. Create Tenant

**Endpoint**: `POST /admin/tenants`  
**Access**: Superadmin only

**Request Body**:

```json
{
  "name": "Fitness First Gym",
  "address": "123 Main Street, Mumbai",
  "google_map": "https://maps.google.com/?q=123+Main+Street+Mumbai",
  "upi_id": "fitnessfirst@paytm",
  "whatsapp_access_token": "EAABwzLixnjYBO...",
  "whatsapp_phone_id": "1234567890"
}
```

**Response** (201 Created):

```json
{
  "id": 3,
  "name": "Fitness First Gym",
  "is_active": true,
  "paid_until": null,
  "upi_id": "fitnessfirst@paytm"
}
```

**Error Response** (409 Conflict):

```json
{
  "detail": "Tenant name already exists"
}
```

---

#### 3. Get Tenant by ID

**Endpoint**: `GET /admin/tenants/{tenant_id}`  
**Access**: Superadmin only

**Example Request**:

```
GET /admin/tenants/1
Authorization: Bearer <superadmin_token>
```

**Response** (200 OK):

```json
{
  "id": 1,
  "name": "Gold's Gym Downtown",
  "is_active": true,
  "paid_until": "2026-12-31",
  "upi_id": "goldsgym@paytm"
}
```

---

#### 4. Update Tenant

**Endpoint**: `PUT /admin/tenants/{tenant_id}`  
**Access**: Superadmin only

**Request Body** (all fields optional):

```json
{
  "name": "Gold's Gym Downtown - Premium",
  "address": "456 New Street, Mumbai",
  "upi_id": "goldsgympremium@paytm"
}
```

**Response** (200 OK):

```json
{
  "id": 1,
  "name": "Gold's Gym Downtown - Premium",
  "is_active": true,
  "paid_until": "2026-12-31",
  "upi_id": "goldsgympremium@paytm"
}
```

---

#### 5. Delete Tenant

**Endpoint**: `DELETE /admin/tenants/{tenant_id}`  
**Access**: Superadmin only

**Example Request**:

```
DELETE /admin/tenants/3
Authorization: Bearer <superadmin_token>
```

**Response** (204 No Content):

```
(empty response)
```

---

#### 6. Update Tenant Subscription

**Endpoint**: `PUT /admin/tenants/{tenant_id}/subscription`  
**Access**: Superadmin only

**Request Body**:

```json
{
  "paid_until": "2027-12-31"
}
```

**Response** (200 OK):

```json
{
  "id": 1,
  "name": "Gold's Gym Downtown",
  "is_active": true,
  "paid_until": "2027-12-31",
  "upi_id": "goldsgym@paytm"
}
```

---

#### 7. Get Tenant Statistics

**Endpoint**: `GET /admin/tenants/{tenant_id}/stats`  
**Access**: Superadmin only

**Example Request**:

```
GET /admin/tenants/1/stats
Authorization: Bearer <superadmin_token>
```

**Response** (200 OK):

```json
{
  "tenant_id": 1,
  "tenant_name": "Gold's Gym Downtown",
  "total_members": 150,
  "active_members": 120,
  "expired_members": 30,
  "is_active": true,
  "paid_until": "2026-12-31"
}
```

---

### User Management

#### 8. List All Gym Owners

**Endpoint**: `GET /admin/users`  
**Access**: Superadmin only

**Query Parameters**:

- `page` (optional, default: 1)
- `page_size` (optional, default: 50)
- `search` (optional): Search by name, username, or email
- `role` (optional): Filter by role (super_admin, gym_owner, gym_staff)

**Example Request**:

```
GET /admin/users?page=1&page_size=10&role=gym_owner
Authorization: Bearer <superadmin_token>
```

**Response** (200 OK):

```json
{
  "users": [
    {
      "id": 2,
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "phone_number": "9876543210",
      "role": "gym_owner",
      "is_active": true,
      "tenant_id": 1
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 10,
  "total_pages": 1
}
```

---

#### 9. Get Gym Owner by ID

**Endpoint**: `GET /admin/users/{user_id}`  
**Access**: Superadmin only

**Response** (200 OK):

```json
{
  "id": 2,
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "phone_number": "9876543210",
  "role": "gym_owner",
  "is_active": true,
  "tenant_id": 1
}
```

---

#### 10. Update User

**Endpoint**: `PUT /admin/users/{user_id}`  
**Access**: Superadmin only

**Request Body** (all fields optional):

```json
{
  "name": "John Doe Jr.",
  "email": "johnjr@example.com",
  "phone_number": "9876543211",
  "role": "gym_staff"
}
```

**Response** (200 OK):

```json
{
  "id": 2,
  "name": "John Doe Jr.",
  "username": "johndoe",
  "email": "johnjr@example.com",
  "phone_number": "9876543211",
  "role": "gym_staff",
  "is_active": true,
  "tenant_id": 1
}
```

---

#### 11. Delete User

**Endpoint**: `DELETE /admin/users/{user_id}`  
**Access**: Superadmin only

**Response** (204 No Content):

```
(empty response)
```

---

#### 12. Update User Role

**Endpoint**: `PUT /admin/users/{user_id}/role`  
**Access**: Superadmin only

**Request Body**:

```json
"gym_owner"
```

**Response** (200 OK):

```json
{
  "id": 2,
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "phone_number": "9876543210",
  "role": "gym_owner",
  "is_active": true,
  "tenant_id": 1
}
```

---

### System Statistics

#### 13. Get System Overview

**Endpoint**: `GET /admin/stats/overview`  
**Access**: Superadmin only

**Response** (200 OK):

```json
{
  "total_tenants": 5,
  "total_users": 25,
  "total_members": 500
}
```

---

## User Endpoints

> **Note**: All user endpoints are tenant-scoped (users can only access their own tenant's data)

### 1. Get Current User

**Endpoint**: `GET /users/me`  
**Access**: Authenticated

**Response** (200 OK):

```json
{
  "id": 2,
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "phone_number": "9876543210",
  "role": "gym_owner",
  "is_active": true,
  "tenant_id": 1
}
```

---

### 2. Change Own Password

**Endpoint**: `PUT /users/me/password`  
**Access**: Authenticated

**Request Body**:

```json
{
  "old_password": "SecurePass123!",
  "new_password": "NewSecurePass456!"
}
```

**Response** (200 OK):

```json
{
  "message": "Password changed successfully"
}
```

---

### 3. List Users in Tenant

**Endpoint**: `GET /users/`  
**Access**: Authenticated

**Query Parameters**:

- `page` (optional, default: 1)
- `page_size` (optional, default: 50)
- `search` (optional)
- `role` (optional)

**Example Request**:

```
GET /users/?page=1&page_size=10
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "users": [
    {
      "id": 2,
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "phone_number": "9876543210",
      "role": "gym_owner",
      "is_active": true,
      "tenant_id": 1
    },
    {
      "id": 3,
      "name": "Jane Smith",
      "username": "janesmith",
      "email": "jane@example.com",
      "phone_number": "9876543211",
      "role": "gym_staff",
      "is_active": true,
      "tenant_id": 1
    }
  ],
  "total": 2,
  "page": 1,
  "page_size": 10,
  "total_pages": 1
}
```

---

### 4. Create User in Tenant

**Endpoint**: `POST /users/`  
**Access**: Authenticated

**Request Body**:

```json
{
  "name": "New Staff Member",
  "username": "newstaff",
  "email": "newstaff@example.com",
  "phone_number": "9876543212",
  "password": "SecurePass123!",
  "role": "gym_staff"
}
```

**Response** (201 Created):

```json
{
  "id": 4,
  "name": "New Staff Member",
  "username": "newstaff",
  "email": "newstaff@example.com",
  "phone_number": "9876543212",
  "role": "gym_staff",
  "is_active": true,
  "tenant_id": 1
}
```

**Error Response** (409 Conflict):

```json
{
  "detail": "Username already exists"
}
```

---

### 5. Get User by ID

**Endpoint**: `GET /users/{user_id}`  
**Access**: Authenticated (tenant-scoped)

**Response** (200 OK):

```json
{
  "id": 3,
  "name": "Jane Smith",
  "username": "janesmith",
  "email": "jane@example.com",
  "phone_number": "9876543211",
  "role": "gym_staff",
  "is_active": true,
  "tenant_id": 1
}
```

---

### 6. Update User

**Endpoint**: `PUT /users/{user_id}`  
**Access**: Authenticated (tenant-scoped)

**Request Body** (all fields optional):

```json
{
  "name": "Jane Smith Updated",
  "email": "janeupdated@example.com"
}
```

**Response** (200 OK):

```json
{
  "id": 3,
  "name": "Jane Smith Updated",
  "username": "janesmith",
  "email": "janeupdated@example.com",
  "phone_number": "9876543211",
  "role": "gym_staff",
  "is_active": true,
  "tenant_id": 1
}
```

---

### 7. Delete User

**Endpoint**: `DELETE /users/{user_id}`  
**Access**: Authenticated (tenant-scoped)

**Response** (204 No Content):

```
(empty response)
```

**Error Response** (400 Bad Request - self-deletion):

```json
{
  "detail": "Cannot delete your own account"
}
```

---

## Tenant Endpoints

> **Note**: Users can only access their own tenant's information

### 1. Get Own Tenant

**Endpoint**: `GET /tenants/me`  
**Access**: Authenticated

**Response** (200 OK):

```json
{
  "id": 1,
  "name": "Gold's Gym Downtown",
  "is_active": true,
  "paid_until": "2026-12-31",
  "upi_id": "goldsgym@paytm"
}
```

---

### 2. Update Own Tenant

**Endpoint**: `PUT /tenants/me`  
**Access**: Authenticated

**Request Body** (all fields optional):

```json
{
  "name": "Gold's Gym Downtown - Updated",
  "address": "789 Updated Street, Mumbai",
  "upi_id": "goldsupdated@paytm"
}
```

**Response** (200 OK):

```json
{
  "id": 1,
  "name": "Gold's Gym Downtown - Updated",
  "is_active": true,
  "paid_until": "2026-12-31",
  "upi_id": "goldsupdated@paytm"
}
```

---

### 3. Get Own Tenant Statistics

**Endpoint**: `GET /tenants/me/stats`  
**Access**: Authenticated

**Response** (200 OK):

```json
{
  "tenant_id": 1,
  "tenant_name": "Gold's Gym Downtown",
  "total_members": 150,
  "active_members": 120,
  "expired_members": 30,
  "is_active": true,
  "paid_until": "2026-12-31"
}
```

---

## Member Endpoints

> **Note**: All member endpoints are tenant-scoped

### 1. List Members

**Endpoint**: `GET /members/`  
**Access**: Authenticated

**Query Parameters**:

- `page` (optional, default: 1)
- `page_size` (optional, default: 50)
- `search` (optional): Search by name or phone
- `status` (optional): Filter by status (ACTIVE, EXPIRED, INACTIVE)

**Example Request**:

```
GET /members/?page=1&page_size=10&status=ACTIVE
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "members": [
    {
      "id": 1,
      "first_name": "Rahul",
      "last_name": "Sharma",
      "phone_number": "9123456789",
      "email": "rahul@example.com",
      "joining_date": "2026-01-01",
      "membership_expiry_date": "2026-02-01",
      "membership_type": "Monthly",
      "status": "ACTIVE",
      "is_active": true,
      "tenant_id": 1
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 10,
  "total_pages": 1
}
```

---

### 2. Create Member

**Endpoint**: `POST /members/`  
**Access**: Authenticated

**Request Body**:

```json
{
  "first_name": "Priya",
  "last_name": "Patel",
  "phone_number": "9123456790",
  "email": "priya@example.com",
  "joining_date": "2026-01-20",
  "membership_type": "3 Months"
}
```

**Response** (201 Created):

```json
{
  "id": 2,
  "first_name": "Priya",
  "last_name": "Patel",
  "phone_number": "9123456790",
  "email": "priya@example.com",
  "joining_date": "2026-01-20",
  "membership_expiry_date": "2026-04-20",
  "membership_type": "3 Months",
  "status": "ACTIVE",
  "is_active": true,
  "tenant_id": 1
}
```

**Error Response** (409 Conflict):

```json
{
  "detail": "A member with this phone number already exists"
}
```

---

### 3. Get Member by ID

**Endpoint**: `GET /members/{member_id}`  
**Access**: Authenticated (tenant-scoped)

**Response** (200 OK):

```json
{
  "id": 1,
  "first_name": "Rahul",
  "last_name": "Sharma",
  "phone_number": "9123456789",
  "email": "rahul@example.com",
  "joining_date": "2026-01-01",
  "membership_expiry_date": "2026-02-01",
  "membership_type": "Monthly",
  "status": "ACTIVE",
  "is_active": true,
  "tenant_id": 1
}
```

---

### 4. Update Member

**Endpoint**: `PUT /members/{member_id}`  
**Access**: Authenticated (tenant-scoped)

**Request Body** (all fields optional):

```json
{
  "first_name": "Rahul Updated",
  "email": "rahulupdated@example.com",
  "membership_type": "6 Months"
}
```

**Response** (200 OK):

```json
{
  "id": 1,
  "first_name": "Rahul Updated",
  "last_name": "Sharma",
  "phone_number": "9123456789",
  "email": "rahulupdated@example.com",
  "joining_date": "2026-01-01",
  "membership_expiry_date": "2026-02-01",
  "membership_type": "6 Months",
  "status": "ACTIVE",
  "is_active": true,
  "tenant_id": 1
}
```

---

### 5. Delete Member

**Endpoint**: `DELETE /members/{member_id}`  
**Access**: Authenticated (tenant-scoped)

**Response** (204 No Content):

```
(empty response)
```

---

### 6. Renew Membership

**Endpoint**: `POST /members/{member_id}/renew`  
**Access**: Authenticated (tenant-scoped)

**Request Body**:

```json
{
  "membership_type": "1 Year",
  "renewal_date": "2026-01-20"
}
```

**Response** (200 OK):

```json
{
  "id": 1,
  "first_name": "Rahul",
  "last_name": "Sharma",
  "phone_number": "9123456789",
  "email": "rahul@example.com",
  "joining_date": "2026-01-01",
  "membership_expiry_date": "2027-01-20",
  "membership_type": "1 Year",
  "status": "ACTIVE",
  "is_active": true,
  "tenant_id": 1
}
```

---

## Health Check

### Get Health Status

**Endpoint**: `GET /`  
**Access**: Public

**Response** (200 OK):

```json
{
  "status": "running",
  "message": "Gym Management SaaS is Live",
  "version": "1.0.0",
  "environment": "development"
}
```

---

## Common Error Responses

### 401 Unauthorized

```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden

```json
{
  "detail": "User must be associated with a tenant"
}
```

### 404 Not Found

```json
{
  "detail": "User not found"
}
```

### 422 Validation Error

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "Invalid email format",
      "type": "value_error"
    }
  ]
}
```

### 500 Internal Server Error

```json
{
  "detail": "An error occurred while processing your request"
}
```

---

## Authentication Flow

1. **Login**: `POST /auth/login` → Receive `access_token`
2. **Use Token**: Include in all subsequent requests:
   ```
   Authorization: Bearer <access_token>
   ```
3. **Token Expiry**: Tokens expire after configured time (default: 30 days)
4. **Re-login**: When token expires, login again to get new token

---

## Role-Based Access

| Role            | Access Level                                              |
| --------------- | --------------------------------------------------------- |
| **super_admin** | Full access to all endpoints including `/admin/*`         |
| **gym_owner**   | Access to own tenant's data (users, members, tenant info) |
| **gym_staff**   | Access to own tenant's data (users, members, tenant info) |

---

## Pagination

All list endpoints support pagination:

**Query Parameters**:

- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 50, max: 100)

**Response Format**:

```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "page_size": 50,
  "total_pages": 2
}
```

---

## Membership Types

Valid membership types:

- `"Monthly"` - 1 month duration
- `"3 Months"` - 3 months duration
- `"6 Months"` - 6 months duration
- `"1 Year"` - 12 months duration

---

## Member Status

- `ACTIVE`: Membership is currently valid
- `EXPIRED`: Membership has expired
- `INACTIVE`: Member is soft-deleted

Status is automatically calculated based on `membership_expiry_date`.

---

## Testing with cURL

### Example: Login and Create Member

```bash
# 1. Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=johndoe&password=SecurePass123!"

# Response: {"access_token": "eyJ...", "token_type": "bearer"}

# 2. Create Member (use token from step 1)
curl -X POST http://localhost:8000/members/ \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "Member",
    "phone_number": "9999999999",
    "email": "test@example.com",
    "joining_date": "2026-01-20",
    "membership_type": "Monthly"
  }'
```

---

## Interactive Documentation

Visit `http://localhost:8000/docs` for interactive Swagger UI documentation where you can:

- View all endpoints
- Test endpoints directly
- See request/response schemas
- Authenticate and test with real tokens

---

**Last Updated**: 2026-01-20  
**API Version**: 1.0.0
