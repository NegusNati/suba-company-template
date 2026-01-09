# Gallery Management Feature - README

## Overview

Complete gallery management system with CRUD operations for managing images with metadata. Includes image upload, optional title/description, and occurred date tracking.

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Image upload with preview (JPEG, PNG, GIF, WebP)
- ✅ Optional metadata (title, description, occurred date)
- ✅ Search by title
- ✅ Pagination support
- ✅ Loading states and skeletons
- ✅ Empty states
- ✅ Delete confirmation dialogs
- ✅ Toast notifications
- ✅ Responsive design

## File Structure

```
gallery/
├── index.tsx                          # Main list view with DataTable
├── columns.tsx                        # Table column definitions
├── schema.ts                          # Main Zod schemas
├── lib/
│   ├── gallery-api.ts                # API functions
│   ├── gallery-query.ts              # React Query hooks
│   ├── gallery-schema.ts             # Schema exports + list params
│   └── index.ts                      # Barrel export
├── form/
│   ├── gallery-item-form.tsx         # Main form component
│   ├── gallery-preview.tsx           # Live preview panel
│   ├── create-gallery-item.tsx       # Create wrapper
│   └── edit-gallery-item.tsx         # Edit wrapper
└── detail/
    └── index.tsx                      # Detail view
```

## Routes

- `/dashboard/gallery` - Image list with search
- `/dashboard/gallery/create` - Add new image
- `/dashboard/gallery/:id` - View image details
- `/dashboard/gallery/:id/edit` - Edit image

## API Integration

All API calls use `/api/v1/gallery` endpoint.

### Endpoints

- `GET /api/v1/gallery` - List images (pagination, search)
- `GET /api/v1/gallery/:id` - Get image details
- `POST /api/v1/gallery` - Create image (multipart/form-data)
- `PATCH /api/v1/gallery/:id` - Update image (multipart/form-data)
- `DELETE /api/v1/gallery/:id` - Delete image

## Usage Examples

### Create Gallery Item

```typescript
import { useCreateGalleryItemMutation } from "./lib/gallery-query";

const createMutation = useCreateGalleryItemMutation({
  onSuccess: () => toast.success("Image added!"),
  onError: (error) => toast.error(error.message),
});

// Submit with image file
createMutation.mutate({
  title: "Summer Vacation",
  description: "Beach photos",
  occurredAt: "2024-07-15T10:30:00Z",
  image: imageFile, // File object
});
```

### Update Gallery Item

```typescript
import { useUpdateGalleryItemMutation } from "./lib/gallery-query";

const updateMutation = useUpdateGalleryItemMutation({
  onSuccess: () => toast.success("Image updated!"),
});

updateMutation.mutate({
  id: 123,
  data: {
    title: "Updated Title",
    description: "New description",
    // Include new image file to replace existing
    image: newImageFile,
  },
});
```

### Search Gallery

```typescript
const { data } = useGalleryItemsQuery({
  page: 1,
  limit: 20,
  search: "vacation",
  sortBy: "occurredAt",
  sortOrder: "desc",
});
```

## Form Validation

- **Image**: Required for create, optional for update. Max 10MB. Types: JPEG, PNG, GIF, WebP
- **Title**: Optional, max 255 characters
- **Description**: Optional, any length
- **Occurred At**: Optional, datetime format

## State Management

- **React Query** for server state and caching
- **Tanstack Form** for form state management
- **Local state** for image previews and UI interactions

## Testing Checklist

- [ ] Upload image (all supported formats)
- [ ] Create with minimal data (image only)
- [ ] Create with full metadata
- [ ] View image in detail page
- [ ] Edit image metadata
- [ ] Replace image (upload new one)
- [ ] Delete image
- [ ] Search by title
- [ ] Pagination through images
- [ ] Test empty states
- [ ] Test error scenarios (file too large, invalid format)
