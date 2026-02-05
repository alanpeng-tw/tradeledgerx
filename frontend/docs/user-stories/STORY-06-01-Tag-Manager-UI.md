# STORY-06-01: Tag Manager UI

## 1. Description
The administrative interface for managing the classification system (Tags) used in the Journal.

## 2. Goals
- Provide full control over the tag library.
- Differentiate between "Strategy" and "Mistake" tags.

## 3. Acceptance Criteria
- [ ] **UI Component (`TagManagerPage`)**:
    - **Header**: Title + "Create New Tag" Button.
    - **List View**:
        - Grid or List display of tags.
        - Each item shows: Name, Type (Badge), Color (Dot), Actions (Edit/Delete).
- [ ] **Create/Edit Dialog**:
    - **Fields**:
        - Name (Text, required).
        - Type (Select: Strategy/Mistake, required).
        - Color (Color Picker or Preset Palette).
    - **Validation**: Name must be unique (handle 409 Conflict from API).
- [ ] **Deletion**:
    - "Delete" button triggers a confirmation alert.
    - "Are you sure you want to delete tag '{name}'?".

## 4. Technical Notes
- Use a Color Picker component (e.g., `react-color` or simple HTML input type='color').
- Ensure UI handles "Loading" and "Error" states during CRUD operations.
