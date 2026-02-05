# STORY-01-03: Login Feature

## 1. Description
Create the user interface for authentication. Since this is an internal/single-user system initially, a simple but secure login form is required to obtain the JWT.

## 2. Goals
- Provide a way for the user to authenticate.
- Validate input before sending to server.

## 3. Acceptance Criteria
- [ ] **UI Component (`LoginPage`)**:
    - Centered card layout.
    - Fields: Username (Text), Password (Password type).
    - "Login" Button (Disabled while loading).
- [ ] **Integration**:
    - Visual feedback on loading (Spinner).
    - Visual feedback on error ("Invalid credentials").
    - On success:
        1. Call `POST /api/v1/login`.
        2. Receive Token.
        3. Store Token via `setToken()`.
        4. Redirect user to Dashboard (`/`).

## 4. Technical Notes
- Use `react-hook-form` for form state management.
- For development/MVP phase, if backend auth isn't fully ready, allow a "Dev Login" that accepts a hardcoded token or bypasses if configured, but the UI must be production-ready.
