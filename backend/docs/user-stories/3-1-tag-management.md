# Story 3-1: Tag Management System

**Epic**: EPIC-03 Tag Management
**Status**: ready-for-dev

## 1. Story Narrative
**As an** Admin
**I want to** maintain a standardized library of tags (Strategies and Mistakes)
**So that** all trading data is standardized for later analysis.

## 2. Acceptance Criteria
- [ ] **Admin Control**: Only `role='admin'` can Create/Update/Delete tags.
- [ ] **Public Access**: Authenticated Users can `GET` the list of tags.
- [ ] **Tag Structure**: Tags have `name` (Unique), `type` (STRATEGY/MISTAKE), and `color`.
- [ ] **Integrity**: Duplicate tag names are prevented.

## 3. Technical Requirements (Guide)
- **Data Model**: `Tag` document in `tags` collection.
- **API**:
    - `GET /api/v1/tags`
    - `POST /api/v1/tags` (Admin)
    - `PUT /api/v1/tags/{id}` (Admin)
    - `DELETE /api/v1/tags/{id}` (Admin)

### Architecture Compliance
- **Service**: `TagService`.
- **Model**: `class Tag(Document)` (See SDD 4.3).
- **Security**: Check JWT claims for `role`.

### Development Notes
- Refer to **SDD-BACKEND Section 3.4**.
- Pre-seed some default tags (e.g., "FOMO", "SMC", "Breakout") if the DB is empty.
