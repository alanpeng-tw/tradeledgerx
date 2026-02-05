# STORY-04-04: Media Attachments Manager

## 1. Description
Allows traders to attach evidence to their journal entries, primarily in the form of URLs (e.g., TradingView chart links) or potentially direct image uploads (Phase 2).

## 2. Goals
- Link external chart screenshots to trades.
- Preview images ensuring the link is valid.

## 3. Acceptance Criteria
- [ ] **UI Component (`MediaManager`)**:
    - Input: Text field for URL + "Add" button.
    - List: Grid of added images.
- [ ] **Behavior**:
    - User pastes URL -> Clicks Add -> URL added to list.
    - **Preview**: Each item in list renders an `<img>` tag.
    - **Remove**: "X" button on image to remove from list.
- [ ] **Validation**:
    - Basic URL format check.
    - (Advanced) Try to load image; if fails, show "Broken Link" icon.

## 4. Technical Notes
- Store as `string[]` in the form state.
- Component should be uncontrolled or controlled by parent form.
- Use `useFieldArray` from `react-hook-form` if integrating directly.
