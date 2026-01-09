# Contact Us CRUD Management

## Overview

Complete contact management system with full admin CRUD operations and a public-facing contact form API (no authentication required).

## Features

### Admin Dashboard

- ✅ View all contact submissions
- ✅ Search by name or contact info
- ✅ Filter by status (All, Pending, Handled)
- ✅ Mark contacts as handled/unhandled
- ✅ Delete contacts
- ✅ View full contact details
- ✅ Loading states and skeletons
- ✅ Empty states
- ✅ Toast notifications

### Public Contact Form

- ✅ No authentication required
- ✅ Client-side validation
- ✅ Success confirmation
- ✅ Error handling
- ✅ Optional service association
- ✅ Reusable component

## File Structure

```
contact-us/
├── index.tsx                          # Admin list view with DataTable
├── columns.tsx                        # Table column definitions
├── schema.ts                          # Main Zod schemas
├── lib/
│   ├── contact-api.ts                # API functions (admin + public)
│   ├── contact-query.ts              # React Query hooks
│   ├── contact-schema.ts             # Schema exports + list params
│   └── index.ts                      # Barrel export
└── detail/
    └── index.tsx                      # Detail view

contact/ (public)
├── ContactForm.tsx                    # Public-facing form component
├── schema.ts                          # Public form schema
└── index.ts                           # Barrel export
```

## Routes

- `/dashboard/contact-us` - Admin list view
- `/dashboard/contact-us/:id` - Admin detail view

## API Integration

### Admin Endpoints (Auth Required)

```typescript
// List contacts
GET /api/v1/contacts?page=1&limit=10&search=query&isHandled=true

// Get contact by ID
GET /api/v1/contacts/:id

// Update contact status
PATCH /api/v1/contacts/:id
Body: { isHandled: boolean }

// Delete contact
DELETE /api/v1/contacts/:id
```

### Public Endpoint (No Auth)

```typescript
// Submit contact form
POST /api/v1/contact
Body: {
  fullName: string;
  contact: string; // email or phone
  message: string;
  serviceId?: number; // optional
}
```

## Usage Examples

### Admin Dashboard Hooks

```typescript
import {
  useContactsQuery,
  useContactByIdQuery,
  useUpdateContactMutation,
  useDeleteContactMutation,
} from "./lib";

// List contacts with filters
const { data, isPending } = useContactsQuery({
  page: 1,
  limit: 10,
  search: "john",
  isHandled: false, // only pending
});

// Get single contact
const { data } = useContactByIdQuery(123);

// Update status
const updateMutation = useUpdateContactMutation({
  onSuccess: () => toast.success("Status updated!"),
});

updateMutation.mutate({
  id: 123,
  data: { isHandled: true },
});

// Delete contact
const deleteMutation = useDeleteContactMutation({
  onSuccess: () => toast.success("Contact deleted!"),
});

deleteMutation.mutate(123);
```

### Public Contact Form

```typescript
import { ContactForm } from "@/features/contact";

// In your landing page component
<ContactForm
  serviceId={5} // optional: associate with a service
  onSuccess={() => console.log("Form submitted!")}
  className="max-w-2xl"
/>
```

Or use the hook directly:

```typescript
import { useSubmitContactMutation } from "@/features/dashboard/contact-us/lib";

const submitMutation = useSubmitContactMutation({
  onSuccess: () => toast.success("Thank you for contacting us!"),
  onError: (error) => toast.error(error.message),
});

submitMutation.mutate({
  fullName: "John Doe",
  contact: "john@example.com",
  message: "Hello, I'd like to inquire about...",
  serviceId: 5, // optional
});
```

## Form Validation

### Contact Field

- Required
- Accepts email or phone number formats
- Email format: `user@domain.com`
- Phone format: Digits with optional spaces, dashes, plus, parentheses

### Message

- Required
- Minimum 10 characters

### Full Name

- Required
- Minimum 1 character

### Service ID

- Optional
- Must be a valid service ID if provided

## State Management

- **React Query** for server state and caching
- **Tanstack Form** for form state (public form)
- **Local state** for UI interactions (dialogs, filters)

## Testing Checklist

### Admin Dashboard

- [ ] List all contacts with pagination
- [ ] Search by full name
- [ ] Search by contact (email/phone)
- [ ] Filter by status (All, Pending, Handled)
- [ ] Navigate to contact detail page
- [ ] Mark contact as handled
- [ ] Mark contact as unhandled
- [ ] Delete contact (with confirmation)
- [ ] View empty state (no contacts)
- [ ] View empty state (no search results)
- [ ] View loading skeletons

### Public Contact Form

- [ ] Submit form with valid data
- [ ] Validate required fields
- [ ] Validate email format
- [ ] Validate phone format
- [ ] Validate message length (min 10 chars)
- [ ] See success message after submission
- [ ] Handle submission errors
- [ ] Test with serviceId
- [ ] Test without serviceId
- [ ] Test without authentication

### Error Scenarios

- [ ] Submit form with network error
- [ ] Load contacts with network error
- [ ] Delete non-existent contact
- [ ] Update non-existent contact
- [ ] Invalid contact format
- [ ] Message too short

## Key Differences from Gallery Feature

1. **No Create in Admin**: Admin cannot create contacts - only public can submit
2. **Status Management**: Focus on handled/unhandled toggle
3. **Public API**: Separate public endpoint without authentication
4. **Simpler Updates**: Only `isHandled` field can be updated
5. **No File Uploads**: Text-only data
6. **Service Association**: Optional link to services table

## Public Form Integration Example

```tsx
// In your landing page (e.g., /contact)
import { ContactForm } from "@/features/contact";

export default function ContactPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8">Get in Touch</h1>
      <ContactForm
        onSuccess={() => {
          // Optional: redirect or show custom message
          console.log("Form submitted successfully!");
        }}
      />
    </div>
  );
}
```

## Notes

- The public contact form uses the `/api/v1/contact` endpoint (no `/s`)
- The admin dashboard uses `/api/v1/contacts` endpoint (with `/s`)
- Both endpoints are configured on the backend with appropriate authentication middleware
- Public submissions automatically set `isHandled: false`
- Contact validation accepts both email and phone formats
- Service ID is optional and validated on the backend if provided
