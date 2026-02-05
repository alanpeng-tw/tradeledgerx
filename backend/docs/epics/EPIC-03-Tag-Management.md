# EPIC-03: Tag Management System

## 1. Description
This Epic covers the creation and management of tags (Strategies and Mistakes). This is a configuration module primarily used by Admins to set up the standardized criteria that Traders will use for journaling.

## 2. In-Scope User Stories
- **US-003**: Trading Strategy and Mistake Tag Management.
  - "As an Admin, I want to maintain a standardized library of tags..."

## 3. Requirements Analysis (Traceability)
- **PRD**: US-003, AC-003-01, AC-003-02.
- **SRS**:
  - REQ-SYS-005: Tag CRUD API.
- **SDD**:
  - 3.4: Tag Management Module.
  - 4.3: Collection `tags`.

## 4. Technical Tasks
### 4.1 Data Modeling
- [ ] Create `Tag` Beanie model with fields: `name`, `type` (Strategy/Mistake), `color`.
- [ ] Ensure `name` is unique.

### 4.2 API Implementation
- [ ] Implement `GET /api/v1/tags` (Public/Authenticated User read access).
- [ ] Implement `POST /api/v1/tags` (Admin only).
- [ ] Implement `PUT/DELETE` endpoints (Admin only).

### 4.3 Permission Logic
- [ ] Add check in Service layer to ensure only users with `role='admin'` can modify tags.

## 5. Acceptance Criteria
- Admin can create, edit, delete tags.
- Regular users can ONLY list tags.
- Tags are correctly categorized as 'Strategy' or 'Mistake'.
- Duplicate tag names are prevented.
