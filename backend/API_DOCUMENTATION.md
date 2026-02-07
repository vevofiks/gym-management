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
6. [Membership Plans](#membership-plans)
7. [Fee Management](#fee-management)
8. [Expense Management](#expense-management)
9. [Tenant Subscriptions](#tenant-subscriptions)
10. [Diet Plans](#diet-plans)
11. [Advanced Reports](#advanced-reports)
12. [Health Check](#health-check)

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
  "role": "gym_staff",
  "plan_id": 1,
  "before_photo_url": "https://res.cloudinary.com/demo/image/upload/v12345/before.jpg"
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

### 8. Get Member Detailed Profile

**Endpoint**: `GET /members/{member_id}/profile`  
**Access**: Authenticated (Gym Owner/Staff)  
**Description**: Get comprehensive member profile with payment history and plan details

**Response** (200 OK):

```json
{
  "id": 5,
  "first_name": "Amit",
  "last_name": "Kumar",
  "phone_number": "9876543210",
  "email": "amit@example.com",
  "joining_date": "2026-01-01",
  "membership_expiry_date": "2026-02-01",
  "status": "ACTIVE",
  "before_photo_url": "https://res.cloudinary.com/demo/image/upload/v1/before.jpg",
  "after_photo_url": null,
  "plan": {
    "id": 1,
    "name": "Starter Plan",
    "duration_days": 30,
    "price": 1999.0,
    "description": "Basic fitness plan"
  },
  "current_plan_start_date": "2026-01-01",
  "plan_days_remaining": 25,
  "total_fees_paid": 1999.0,
  "outstanding_dues": 0.0,
  "recent_payments": [
    {
      "id": 10,
      "payment_date": "2026-01-01",
      "amount": 1999.0,
      "payment_method": "upi",
      "payment_status": "success"
    }
  ],
  "is_active": true
}
```

---

### 9. Upload Member Photo

**Endpoint**: `POST /members/{member_id}/photo/{photo_type}`  
**Access**: Authenticated  
**Description**: Update member's before or after photo URL

**Path Parameters**:

- `photo_type`: `before` or `after`

**Query Parameters**:

- `photo_url` (required): URL of the uploaded photo (e.g., from Cloudinary)

**Response** (200 OK):

```json
{
  "id": 5,
  "first_name": "Amit",
  "last_name": "Kumar",
  "before_photo_url": "https://res.cloudinary.com/demo/image/upload/v123456/before.jpg",
  "status": "ACTIVE"
  // ... other member fields
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

### 7. Get Detailed Member Profile

**Endpoint**: `GET /members/{member_id}/profile`  
**Access**: Authenticated (tenant-scoped)  
**Description**: Get comprehensive member profile with payment history and plan details

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
  "status": "ACTIVE",
  "before_photo_url": "https://cdn.example.com/photos/member-1-before.jpg",
  "after_photo_url": "https://cdn.example.com/photos/member-1-after.jpg",
  "plan": {
    "id": 1,
    "name": "Premium Monthly",
    "duration_days": 30,
    "price": 2500.0,
    "description": "Full gym access with personal training"
  },
  "current_plan_start_date": "2026-01-01",
  "plan_days_remaining": 11,
  "total_fees_paid": 5000.0,
  "outstanding_dues": 0.0,
  "recent_payments": [
    {
      "id": 1,
      "payment_date": "2026-01-20",
      "amount": 2500.0,
      "payment_method": "CASH",
      "payment_status": "PAID",
      "notes": "Monthly renewal"
    },
    {
      "id": 2,
      "payment_date": "2026-01-01",
      "amount": 2500.0,
      "payment_method": "UPI",
      "payment_status": "PAID",
      "notes": "Initial membership"
    }
  ],
  "is_active": true,
  "created_at": "2026-01-01T10:00:00",
  "updated_at": "2026-01-20T15:30:00"
}
```

---

### 8. Upload Member Photo

**Endpoint**: `POST /members/{member_id}/photo/{photo_type}`  
**Access**: Authenticated (tenant-scoped)  
**Description**: Upload before or after transformation photo for member profile

**Path Parameters**:

- `member_id` (int): Member ID
- `photo_type` (string): "before" or "after"

**Query Parameters**:

- `photo_url` (string, required): URL of the uploaded photo

**Example Request**:

```
POST /members/1/photo/before?photo_url=https://cdn.example.com/photos/member-1-before.jpg
Authorization: Bearer <token>
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
  "membership_expiry_date": "2026-02-01",
  "membership_type": "Monthly",
  "plan_id": 1,
  "current_plan_start_date": "2026-01-01",
  "total_fees_paid": 2500.0,
  "outstanding_dues": 0.0,
  "before_photo_url": "https://cdn.example.com/photos/member-1-before.jpg",
  "after_photo_url": null,
  "status": "ACTIVE",
  "is_active": true,
  "created_at": "2026-01-01T10:00:00",
  "updated_at": "2026-01-20T16:00:00"
}
```

**Upload Flow**:

1. Upload image file to cloud storage (AWS S3, Google Cloud Storage, etc.)
2. Get the publicly accessible URL from the storage service
3. Call this endpoint with the URL
4. The member's profile will be updated with the photo URL

**Error Response** (422 Unprocessable Entity):

```json
{
  "detail": "photo_type must be 'before' or 'after'"
}
```

---

---

## Membership Plans

> **Note**: All plan endpoints require authentication. Gym owners and staff can manage plans for their gym.

### 1. Create Membership Plan

**Endpoint**: `POST /plans/`  
**Access**: Authenticated (Gym Owner/Staff)  
**Description**: Create a custom membership plan with pricing and duration

**Headers**:

```
Authorization: Bearer <access_token>
```

**Request Body**:

```json
{
  "name": "Premium Monthly",
  "description": "Full gym access with personal training",
  "duration_days": 30,
  "price": 2500.0,
  "features": ["Gym Access", "Locker", "Personal Training", "Diet Plan"]
}
```

**Response** (201 Created):

```json
{
  "id": 1,
  "tenant_id": 1,
  "name": "Premium Monthly",
  "description": "Full gym access with personal training",
  "duration_days": 30,
  "price": 2500.0,
  "features": ["Gym Access", "Locker", "Personal Training", "Diet Plan"],
  "is_active": true,
  "created_at": "2026-01-21T10:00:00",
  "updated_at": "2026-01-21T10:00:00"
}
```

---

### 2. List Membership Plans

**Endpoint**: `GET /plans/`  
**Access**: Authenticated (Gym Owner/Staff)  
**Description**: Get paginated list of membership plans

**Headers**:

```
Authorization: Bearer <access_token>
```

**Query Parameters**:

- `page` (optional, default: 1): Page number
- `page_size` (optional, default: 50): Items per page
- `active_only` (optional, default: true): Show only active plans

**Response** (200 OK):

```json
{
  "plans": [
    {
      "id": 1,
      "tenant_id": 1,
      "name": "Premium Monthly",
      "description": "Full gym access with personal training",
      "duration_days": 30,
      "price": 2500.0,
      "features": ["Gym Access", "Locker", "Personal Training", "Diet Plan"],
      "is_active": true,
      "created_at": "2026-01-21T10:00:00",
      "updated_at": "2026-01-21T10:00:00"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 50,
  "total_pages": 1
}
```

---

### 3. Get Membership Plan

**Endpoint**: `GET /plans/{plan_id}`  
**Access**: Authenticated (Gym Owner/Staff)  
**Description**: Get details of a specific plan

**Headers**:

```
Authorization: Bearer <access_token>
```

**Response** (200 OK):

```json
{
  "id": 1,
  "tenant_id": 1,
  "name": "Premium Monthly",
  "description": "Full gym access with personal training",
  "duration_days": 30,
  "price": 2500.0,
  "features": ["Gym Access", "Locker", "Personal Training", "Diet Plan"],
  "is_active": true,
  "created_at": "2026-01-21T10:00:00",
  "updated_at": "2026-01-21T10:00:00"
}
```

---

### 4. Update Membership Plan

**Endpoint**: `PUT /plans/{plan_id}`  
**Access**: Authenticated (Gym Owner/Staff)  
**Description**: Update plan details

**Headers**:

```
Authorization: Bearer <access_token>
```

**Request Body** (all fields optional):

```json
{
  "name": "Premium Monthly Plus",
  "price": 2800.0,
  "features": [
    "Gym Access",
    "Locker",
    "Personal Training",
    "Diet Plan",
    "Spa Access"
  ]
}
```

**Response** (200 OK):

```json
{
  "id": 1,
  "tenant_id": 1,
  "name": "Premium Monthly Plus",
  "description": "Full gym access with personal training",
  "duration_days": 30,
  "price": 2800.0,
  "features": [
    "Gym Access",
    "Locker",
    "Personal Training",
    "Diet Plan",
    "Spa Access"
  ],
  "is_active": true,
  "created_at": "2026-01-21T10:00:00",
  "updated_at": "2026-01-21T11:00:00"
}
```

---

### 5. Delete Membership Plan

**Endpoint**: `DELETE /plans/{plan_id}`  
**Access**: Authenticated (Gym Owner/Staff)  
**Description**: Soft delete a plan (cannot delete if members are using it)

**Headers**:

```
Authorization: Bearer <access_token>
```

**Response** (204 No Content)

**Error Response** (400 Bad Request):

```json
{
  "detail": "Cannot delete plan. 5 active members are using this plan."
}
```

---

### 6. Get Plan Statistics

**Endpoint**: `GET /plans/{plan_id}/stats`  
**Access**: Authenticated (Gym Owner/Staff)  
**Description**: Get member count and revenue statistics for a plan

**Headers**:

```
Authorization: Bearer <access_token>
```

**Response** (200 OK):

```json
{
  "plan_id": 1,
  "plan_name": "Premium Monthly",
  "total_members": 25,
  "active_members": 23,
  "total_revenue": 62500.0
}
```

---

### 5. Get Plan Statistics

**Endpoint**: `GET /plans/{plan_id}/stats`  
**Access**: Authenticated  
**Description**: Get performance metrics for a specific plan

**Response** (200 OK):

```json
{
  "plan_id": 1,
  "plan_name": "Starter Plan",
  "total_members": 45,
  "active_members": 38,
  "total_revenue": 89955.0
}
```

---

## Fee Management

> **Note**: All fee endpoints require authentication. Track member payments and generate financial reports.

### 1. Record Member Payment

**Endpoint**: `POST /fees/members/{member_id}`  
**Access**: Authenticated (Gym Owner/Staff)  
**Description**: Record a fee payment for a member

**Headers**:

```
Authorization: Bearer <access_token>
```

**Request Body**:

```json
{
  "amount": 2500.0,
  "payment_method": "upi",
  "payment_date": "2026-01-21",
  "transaction_id": "UPI123456789",
  "plan_id": 1,
  "notes": "January membership fee"
}
```

**Payment Methods**: `cash`, `upi`, `card`, `bank_transfer`

**Response** (201 Created):

```json
{
  "id": 1,
  "member_id": 123,
  "tenant_id": 1,
  "plan_id": 1,
  "amount": 2500.0,
  "payment_method": "upi",
  "payment_date": "2026-01-21",
  "payment_status": "paid",
  "transaction_id": "UPI123456789",
  "notes": "January membership fee",
  "created_by": 5,
  "created_at": "2026-01-21T10:30:00"
}
```

---

### 2. Get Member Payment History

**Endpoint**: `GET /fees/members/{member_id}`
**Access**: Authenticated (Gym Owner/Staff)  
**Description**: Get all payments made by a specific member

**Headers**:

```
Authorization: Bearer <access_token>
```

**Query Parameters**:

- `page` (optional, default: 1): Page number
- `page_size` (optional, default: 50): Items per page

**Response** (200 OK):

```json
{
  "fees": [
    {
      "id": 1,
      "member_id": 123,
      "tenant_id": 1,
      "plan_id": 1,
      "amount": 2500.0,
      "payment_method": "upi",
      "payment_date": "2026-01-21",
      "payment_status": "paid",
      "transaction_id": "UPI123456789",
      "notes": "January membership fee",
      "created_by": 5,
      "created_at": "2026-01-21T10:30:00"
    }
  ],
  "total": 1,
  "total_amount": 2500.0,
  "page": 1,
  "page_size": 50,
  "total_pages": 1
}
```

---

### 3. List All Fees

**Endpoint**: `GET /fees/`  
**Access**: Authenticated (Gym Owner/Staff)  
**Description**: Get all fee payments for the gym with filters

**Headers**:

```
Authorization: Bearer <access_token>
```

**Query Parameters**:

- `page` (optional, default: 1): Page number
- `page_size` (optional, default: 50): Items per page
- `start_date` (optional): Filter from date (YYYY-MM-DD)
- `end_date` (optional): Filter to date (YYYY-MM-DD)
- `payment_method` (optional): Filter by payment method

**Response** (200 OK):

```json
{
  "fees": [
    {
      "id": 1,
      "member_id": 123,
      "tenant_id": 1,
      "plan_id": 1,
      "amount": 2500.0,
      "payment_method": "upi",
      "payment_date": "2026-01-21",
      "payment_status": "paid",
      "transaction_id": "UPI123456789",
      "notes": "January membership fee",
      "created_by": 5,
      "created_at": "2026-01-21T10:30:00"
    }
  ],
  "total": 1,
  "total_amount": 2500.0,
  "page": 1,
  "page_size": 50,
  "total_pages": 1
}
```

---

### 4. Generate Financial Report

**Endpoint**: `GET /fees/report`  
**Access**: Authenticated (Gym Owner/Staff)  
**Description**: Generate financial report for a date range

**Headers**:

```
Authorization: Bearer <access_token>
```

**Query Parameters** (required):

- `start_date`: Report start date (YYYY-MM-DD)
- `end_date`: Report end date (YYYY-MM-DD)

**Response** (200 OK):

```json
{
  "start_date": "2026-01-01",
  "end_date": "2026-01-31",
  "total_revenue": 75000.0,
  "cash_payments": 25000.0,
  "upi_payments": 35000.0,
  "card_payments": 10000.0,
  "bank_transfer_payments": 5000.0,
  "payment_count": 30,
  "member_count": 28
}
```

---

### 5. Get Fee Statistics

**Endpoint**: `GET /fees/stats`  
**Access**: Authenticated (Gym Owner/Staff)  
**Description**: Get overall fee statistics for the gym

**Headers**:

```
Authorization: Bearer <access_token>
```

**Response** (200 OK):

```json
{
  "total_collected": 150000.0,
  "total_pending": 5000.0,
  "total_refunded": 2500.0,
  "payment_count": 60
}
```

---

## Expense Management

> **Note**: All expense endpoints require authentication (Gym Owner/Staff). Track gym expenses.

### 1. Create Expense

**Endpoint**: `POST /expenses/`
**Access**: Authenticated
**Description**: Record a new expense

**Request Body**:

```json
{
  "category": "rent",
  "amount": 15000.0,
  "payment_method": "bank_transfer",
  "expense_date": "2026-01-25",
  "description": "January Gym Rent"
}
```

**Categories**: `rent`, `utilities`, `equipment`, `salaries`, `maintenance`, `marketing`, `supplies`, `miscellaneous`
**Payment Methods**: `cash`, `upi`, `card`, `bank_transfer`

**Response** (201 Created):

```json
{
  "id": 1,
  "tenant_id": 1,
  "category": "rent",
  "amount": 15000.0,
  "payment_method": "bank_transfer",
  "expense_date": "2026-01-25",
  "description": "January Gym Rent",
  "created_by": 2,
  "created_at": "2026-01-25T10:00:00",
  "updated_at": "2026-01-25T10:00:00"
}
```

---

### 2. List Expenses

**Endpoint**: `GET /expenses/`
**Access**: Authenticated

**Query Parameters**:

- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 50)
- `category`: Filter by category
- `start_date`: Filter from date
- `end_date`: Filter to date
- `payment_method`: Filter by payment type

**Response** (200 OK):

```json
{
  "expenses": [
    {
      "id": 1,
      "category": "rent",
      "amount": 15000.0,
      "expense_date": "2026-01-25",
      "description": "January Gym Rent"
      // ... other fields
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 50,
  "total_pages": 1
}
```

---

### 3. Get Expense Statistics

**Endpoint**: `GET /expenses/summary`
**Access**: Authenticated

**Query Parameters**:

- `start_date` (required)
- `end_date` (required)

**Response** (200 OK):

```json
{
  "total_expenses": 25000.0,
  "category_breakdown": {
    "rent": 15000.0,
    "utilities": 5000.0,
    "salaries": 5000.0
  },
  "payment_method_breakdown": {
    "bank_transfer": 20000.0,
    "cash": 5000.0
  }
}
```

---

## Tenant Subscriptions

> **Note**: Manage your gym's subscription to the platform.

### 1. View Subscription Plans

**Endpoint**: `GET /subscriptions/plans`
**Access**: Authenticated
**Description**: List available plans (Starter, Pro, etc.)

**Response** (200 OK):

```json
[
  {
    "id": 1,
    "name": "Starter",
    "price_monthly": 1499.0,
    "max_members": 100,
    "max_staff": 3,
    "whatsapp_enabled": false,
    "advanced_analytics": false
  },
  {
    "id": 2,
    "name": "Pro",
    "price_monthly": 3499.0,
    "max_members": -1,
    "max_staff": 5,
    "whatsapp_enabled": true,
    "advanced_analytics": true
  }
]
```

---

### 2. Get Current Subscription

**Endpoint**: `GET /subscriptions/me`
**Access**: Authenticated (Gym Owner)

**Response** (200 OK):

```json
{
  "id": 1,
  "tenant_id": 1,
  "plan_id": 2,
  "status": "active",
  "subscription_start_date": "2026-01-01",
  "subscription_end_date": "2026-01-31",
  "auto_renew": true,
  "trial_end_date": null,
  "is_trial_used": true
}
```

---

### 3. Get Detailed Status

**Endpoint**: `GET /subscriptions/me/status`
**Access**: Authenticated (Gym Owner)
**Description**: Check usage limits and feature access

**Response** (200 OK):

```json
{
  "has_subscription": true,
  "is_active": true,
  "status": "active",
  "is_trial": false,
  "days_remaining": 6,
  "plan": {
    "id": 2,
    "name": "Pro",
    "price": 3499.0
  },
  "current_usage": {
    "member_count": 120,
    "staff_count": 2,
    "plan_count": 3
  },
  "plan_limits": {
    "max_members": -1,
    "max_staff": 5,
    "max_plans": -1
  },
  "features": {
    "whatsapp": true,
    "advanced_analytics": true
  }
}
```

---

### 4. Initiate Dummy Payment

**Endpoint**: `POST /subscriptions/payment/dummy/initiate`  
**Access**: Gym Owner  
**Description**: Initiate a simulated payment for subscription (Testing only)

**Request Body**:

```json
{
  "plan_id": 2,
  "payment_method": "upi",
  "notes": "Testing Pro plan upgrade"
}
```

**Response** (200 OK):

```json
{
  "payment_id": 12,
  "order_id": "ORDER_123456",
  "amount": 3999.0,
  "currency": "INR",
  "plan_name": "Pro",
  "status": "pending",
  "message": "Dummy payment initiated. Call /payment/dummy/complete with this payment_id to simulate success."
}
```

---

### 5. Complete Dummy Payment

**Endpoint**: `POST /subscriptions/payment/dummy/complete`  
**Access**: Gym Owner  
**Description**: Complete/verify a simulated payment

**Request Body**:

```json
{
  "payment_id": 12,
  "dummy_transaction_id": "T_SIM_7890",
  "payment_status": "success"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Payment successful! Pro activated.",
  "payment_id": 12,
  "subscription_status": "active",
  "subscription_end_date": "2026-03-06",
  "plan_name": "Pro"
}
```

---

### 6. Payment History

**Endpoint**: `GET /subscriptions/payment/history`  
**Access**: Gym Owner  
**Description**: List all subscription payment records

**Response** (200 OK):

```json
{
  "payments": [
    {
      "id": 12,
      "amount": 3999.0,
      "status": "success",
      "payment_date": "2026-02-06T00:15:00",
      "plan_id": 2
    }
  ],
  "total": 1
}
```

---

## Diet Plans

> **Note**: **Pro Plan Feature**. Templates and assignments for gym members. Requires WhatsApp integration for messaging features.

### 1. Create Diet Plan Template

**Endpoint**: `POST /diet-plans/templates`  
**Access**: Gym Owner/Staff (Pro Plan)

**Request Body**:

```json
{
  "name": "Keto Weight Loss",
  "description": "High fat, low carb diet plan",
  "category": "weight_loss",
  "plan_data": {
    "breakfast": "Eggs and Avocado",
    "lunch": "Grilled Chicken Salad",
    "dinner": "Steak with Broccoli"
  }
}
```

**Categories**: `weight_loss`, `weight_gain`, `muscle_building`, `maintenance`

**Response** (201 Created):

```json
{
  "id": 1,
  "name": "Keto Weight Loss",
  "category": "weight_loss",
  "is_active": true
}
```

---

### 2. List Diet Plan Templates

**Endpoint**: `GET /diet-plans/templates`  
**Query Parameters**:

- `category` (optional): Filter by category
- `active_only` (optional, default: true)

**Response** (200 OK):

```json
{
  "templates": [
    {
      "id": 1,
      "name": "Keto Weight Loss",
      "category": "weight_loss"
    }
  ],
  "total": 1
}
```

---

### 3. Assign Diet Plan to Member

**Endpoint**: `POST /diet-plans/assign`  
**Description**: Assign a plan to a member and optionally send via WhatsApp

**Request Body**:

```json
{
  "member_id": 5,
  "template_id": 1,
  "send_whatsapp": true,
  "notes": "Follow strictly for 30 days"
}
```

**Response** (201 Created):

```json
{
  "id": 10,
  "member_id": 5,
  "template_id": 1,
  "assigned_at": "2026-02-06T00:15:00",
  "whatsapp_sent": true
}
```

---

### 4. Get Member Diet Plans

**Endpoint**: `GET /diet-plans/members/{member_id}/plans`

**Response** (200 OK):

```json
[
  {
    "id": 10,
    "template_name": "Keto Weight Loss",
    "assigned_at": "2026-02-06",
    "notes": "Follow strictly for 30 days"
  }
]
```

---

## Advanced Reports

> **Note**: **Pro Plan Only**. These endpoints provide deeper analytics.

### 1. Financial Report

**Endpoint**: `GET /reports/financial`
**Access**: Authenticated (Pro Plan)

**Query Parameters**:

- `start_date` (optional)
- `end_date` (optional)

**Response** (200 OK):

```json
{
  "summary": {
    "total_revenue": 50000.0,
    "total_expenses": 20000.0,
    "net_profit": 30000.0,
    "profit_margin_percent": 60.0
  },
  "revenue_trend": [
    { "label": "Dec 2025", "value": 45000.0 },
    { "label": "Jan 2026", "value": 50000.0 }
  ],
  "expense_trend": [
    { "label": "Dec 2025", "value": 18000.0 },
    { "label": "Jan 2026", "value": 20000.0 }
  ]
}
```

---

### 2. Member Analytics

**Endpoint**: `GET /reports/members`
**Access**: Authenticated (Pro Plan)

**Response** (200 OK):

```json
{
  "stats": {
    "total_active_members": 120,
    "new_members_this_month": 15,
    "expiring_soon_count": 5,
    "churn_rate_percent": 2.5
  },
  "plan_distribution": [
    { "label": "Monthly", "value": 80, "percentage": 66.6 },
    { "label": "Yearly", "value": 40, "percentage": 33.3 }
  ]
}
```

---

### 3. Outstanding Dues

**Endpoint**: `GET /reports/dues`
**Access**: Authenticated (Pro Plan)

**Response** (200 OK):

```json
[
  {
    "member_id": 5,
    "member_name": "Amit Kumar",
    "amount_due": 500.0,
    "days_overdue": 5
  }
]
```

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

**Last Updated**: 2026-02-06  
**API Version**: 1.1.0
