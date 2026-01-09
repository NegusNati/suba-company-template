# User Management Feature - README

## Overview

Complete user management system with CRUD operations and role assignment functionality for the admin dashboard.

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Role assignment with validation (ADMIN, BLOGGER, USER)
- ✅ File uploads (avatars and profile headshots)
- ✅ Search and filtering
- ✅ Pagination
- ✅ Real-time form preview
- ✅ Loading states and error handling
- ✅ Empty states

## File Structure

```
user-management/
├── index.tsx                    # Main list view with table
├── columns.tsx                  # Table column definitions
├── schema.ts                    # Main Zod schemas
├── lib/
│   ├── users-api.ts            # API layer (documented)
│   ├── users-query.ts          # React Query hooks
│   ├── users-schema.ts         # Schema exports + list params
│   └── index.ts                # Barrel export
├── form/
│   ├── user-form.tsx           # Main form component
│   ├── user-preview.tsx        # Preview panel
│   ├── create-user.tsx         # Create wrapper
│   └── edit-user.tsx           # Edit wrapper
└── detail/
    └── index.tsx               # Detail view
```

## Routes

- `/dashboard/user-management` - User list with search and filters
- `/dashboard/user-management/create` - Create new user
- `/dashboard/user-management/:userId` - User detail view
- `/dashboard/user-management/:userId/edit` - Edit user

## API Integration

All API calls use `/api/v1/users` endpoint which requires authentication and ADMIN role.

### Endpoints Used:

- `GET /api/v1/users` - List users (pagination, search, filters)
- `GET /api/v1/users/:userId` - Get user details
- `POST /api/v1/users` - Create user (multipart/form-data)
- `PATCH /api/v1/users/:userId` - Update user (multipart/form-data)
- `DELETE /api/v1/users/:userId` - Delete user
- `PATCH /api/v1/users/:userId/role` - Assign role
- `GET /api/v1/users/roles` - Get available roles

## Role System

Three roles with different permission levels:

- **ADMIN** - Full system access (red badge)
- **BLOGGER** - Content management access (blue badge)
- **USER** - Limited access (gray badge)

### Role Assignment Rules:

- Cannot demote yourself if you're an ADMIN
- Cannot remove the last ADMIN user
- Requires authentication and ADMIN role

## Usage Examples

### Create a User

```typescript
import { useCreateUserMutation } from "./lib/users-query";

const mutation = useCreateUserMutation({
  onSuccess: () => toast.success("User created!"),
});

mutation.mutate({
  name: "John Doe",
  email: "john@example.com",
  password: "password123",
  role: "USER",
  emailVerified: false,
});
```

### Assign Role

```typescript
import { useAssignRoleMutation } from "./lib/users-query";

const mutation = useAssignRoleMutation({
  onSuccess: () => toast.success("Role assigned!"),
});

mutation.mutate({
  id: "user-id",
  role: { role: "ADMIN" },
});
```

### Filter Users by Role

```typescript
const { data } = useUsersQuery({
  page: 1,
  limit: 10,
  role: "ADMIN", // Filter by role
  search: "john", // Search by name/email
});
```

## Form Validation

Uses Zod schemas for type-safe validation:

- **Name**: Required, min 1 character
- **Email**: Required, valid email format
- **Password**: Required for create, min 8 characters
- **Phone**: Optional, validates format
- **Images**: Optional, validates file types (JPEG, PNG, GIF, WebP)

## State Management

- React Query for server state
- Tanstack Form for form state
- Local state for UI interactions
- Automatic cache invalidation on mutations

## Testing Checklist

- [ ] Create user with all fields
- [ ] Create user with minimal fields
- [ ] Upload avatar and headshot
- [ ] Edit user information
- [ ] Change user role
- [ ] Delete user
- [ ] Search users
- [ ] Filter by role
- [ ] Test pagination
- [ ] Test empty states
- [ ] Test error scenarios
