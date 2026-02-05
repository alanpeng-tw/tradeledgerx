# EPIC-06: Settings & Tag Management

## 1. Description
Administrative functions to manage the metadata of the trading system, primarily the tagging system which drives the analysis.

## 2. Requirements Traceability
| ID | Source | Description |
|---|---|---|
| REQ-SYS-005 | SRS 3.3.1 | Tag CRUD API |
| SDD-5 | SDD-FE | RTM Mapping |

## 3. Scope & Deliverables

### 3.1 Tag Manager
- [ ] **Tag List UI**: Display all available tags.
- [ ] **Create/Edit Tag**:
    - Name (e.g., "FOMO", "Set & Forget").
    - Type (Strategy / Mistake).
    - Color (Color picker).
- [ ] **Delete Tag**: Confirmation dialog.

## 4. Technical Notes
- Tags are global (or per user), not necessarily per account, but check backend logic.
- Ensure deleted tags do not break existing trades (Backend should handle cascade or prevent delete).
