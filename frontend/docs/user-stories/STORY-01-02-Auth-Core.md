# STORY-01-02: Authentication Core Infrastructure

## 1. Description
Implement the non-visual core of the authentication system. This involves managing the JWT token state and ensuring all outgoing API requests are authenticated.

## 2. Goals
- Securely store and retrieve authentication tokens.
- Automatically attach credentials to API requests.
- Handle authentication failures gracefully.

## 3. Acceptance Criteria
- [ ] **State Store (`useAuthStore`)**:
    - Store `token` (string | null).
    - Store `isAuthenticated` (boolean derivation).
    - Action `setToken(token)`: Updates state and saves to `localStorage`.
    - Action `logout()`: Clears state and removes from `localStorage`.
    - **Persistence**: Application reloads restore the token from `localStorage`.
- [ ] **Axios Configuration**:
    - Base URL set to backend API (e.g., via `VITE_API_URL` env var).
- [ ] **Request Interceptor**:
    - Reads token from store.
    - If token exists, injects header: `Authorization: Bearer <token>`.
- [ ] **Response Interceptor**:
    - Intercepts `401 Unauthorized` responses.
    - Automatically triggers `logout()` action to clear state.

## 4. Technical Notes
- **File**: `src/store/authStore.ts` (Zustand).
- **File**: `src/api/client.ts` (Axios instance).
- Avoid circular dependencies between Axios interceptors and the Zustand store (use `useAuthStore.getState()` inside the interceptor).
