# STORY-04-03: Tag Multi-Select Component

## 1. Description
A reusable input component allowing efficient selection of multiple tags (Strategies or Mistakes). It must handle searching significantly large lists of tags.

## 2. Goals
- Quick selection of existing tags.
- Visual categorization of selected tags.

## 3. Acceptance Criteria
- [ ] **UI Component (`TagMultiSelect`)**:
    - Based on MUI `Autocomplete` (multiple mode).
    - **Props**:
        - `type`: 'STRATEGY' | 'MISTAKE' (Filters available tags).
        - `value`: selected IDs.
        - `onChange`: callback.
- [ ] **Data Source**:
    - Fetch from `GET /api/v1/tags`.
    - Cache heavily (tags change infrequently).
- [ ] **Display**:
    - Selected items shown as Chips.
    - Option list shows Name and Color dot.
- [ ] **Error Handling**:
    - If the API fails, allow manual entry (optional) or show retry.

## 4. Technical Notes
- This is a dumb/presentational component that consumes data.
- React Query: `staleTime: Infinity` (or 1 hour).
- Performance: Use virtualization (`react-window`) if tag count > 1000.
