# STORY-01-05: Routing System & Guards

## 1. Description
Configure the client-side routing logic to stitch all pages together and protect private resources from unauthorized access.

## 2. Goals
- Define URL structure.
- Prevent unauthenticated access.
- Prevent app crashes from breaking the entire UI.

## 3. Acceptance Criteria
- [ ] **Route Definitions**:
    - `/login` -> Public.
    - `/` -> Protected (Redirects to Dashboard).
    - `/journal` -> Protected.
    - `/analytics` -> Protected.
    - `/settings` -> Protected.
    - `*` (404) -> "Page Not Found".
- [ ] **Auth Guard Component**:
    - Wraps all protected routes.
    - Checks `isAuthenticated` from store.
    - If false, Redirect to `/login` (preserve requested URL for redirect-back).
- [ ] **Global Error Boundary**:
    - Wrap the entire app.
    - If a crash occurs, show a friendly "Something went wrong" UI with a "Reload" button.

## 4. Technical Notes
- Use `react-router-dom` v6+.
- Use `createBrowserRouter` or equivalent modern API.
- Error Boundary can be a class component or use `react-error-boundary` library.
