# STORY-01-04: Application Layout & Navigation

## 1. Description
Construct the main shell of the application that houses the navigation and content areas. This layout will wrap all authenticated pages.

## 2. Goals
- Provide consistent navigation across the app.
- Maximize screen real estate for data.

## 3. Acceptance Criteria
- [x] **Sidebar Navigation**:
    - Fixed width (collapsible on mobile nice-to-have).
    - Links:
        - Dashboard (Home Icon).
        - Journal (Book/List Icon).
        - Analytics (Chart Icon).
        - Settings (Gear Icon).
    - Highlight the active route.
- [x] **Header (AppBar)**:
    - App Title / Logo.
    - **Logged-in username**: Display the **logged-in user's username** (e.g. from auth store / JWT or user API), **not** a generic label like "使用者" or "User". If username is available (e.g. after login), it must be shown in the header (e.g. next to user icon or in a user menu).
    - Placeholder for "Account Switcher" (See STORY-02-03).
    - "Logout" Button (Icon).
- [x] **Main Content Area**:
    - Render `Outlet` for child routes.
    - Proper padding/margins.
    - Scrollable independently of sidebar.

## 4. Technical Notes
- Use `MUI Drawer` for Sidebar.
- Use `MUI AppBar` for Header.
- Ensure `Layout` component wraps authenticated routes only (not Login).
- **Username display**: Header must show the logged-in username (e.g. from auth store). If backend does not include `username` in JWT payload, ensure login flow stores username (e.g. from login response or from a `/me` API) and exposes it in auth store so the header can display it instead of generic "使用者".
