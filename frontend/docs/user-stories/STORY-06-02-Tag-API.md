# STORY-06-02: Tag CRUD API Integration

## 1. Description
Connects the Tag Manager UI to the backend storage.

## 2. Goals
- Persist tag data.
- Ensure data integrity.

## 3. Acceptance Criteria
- [ ] **API Client**:
    - `getTags()`: `GET /api/v1/tags`.
    - `createTag(data)`: `POST /api/v1/tags`.
    - `updateTag(id, data)`: `PUT /api/v1/tags/{id}`.
    - `deleteTag(id)`: `DELETE /api/v1/tags/{id}`.
- [ ] **React Query**:
    - Key: `['tags']`.
    - **Mutations**:
        - On `createTag` success: Invalidate `['tags']`.
        - On `updateTag` success: Invalidate `['tags']`.
        - On `deleteTag` success: Invalidate `['tags']`.

## 4. Technical Notes
- Optimistic updates are nice to have but not strictly required for this admin feature.
- Error handling: Display Toast notifications on success/failure.
