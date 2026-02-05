# EPIC-01: Core Infrastructure & Authentication

## 1. Description
Establish the foundational frontend architecture, including global layout, routing, and secure authentication handling. This epic ensures the application is secure, responsive, and ready for feature modules.

## 2. Requirements Traceability
| ID | Source | Description |
|---|---|---|
| REQ-NFR-005 | SRS 5.2 | CORS Compliance & Secure API communication |
| REQ-SYS-003 | SRS 3.1.2 | API Header Injection (Authorization) |
| SDD-3.1 | SDD-FE | Auth & Portfolio Module (partial) |
| SDD-4.1 | SDD-FE | Global Error Boundary |

## 3. Scope & Deliverables

### 3.1 Project Initial Setup
- [ ] Initialize React 18 + TypeScript + Vite project.
- [ ] Configure Material UI (MUI) v5 theme (Dark Mode default).
- [ ] Setup core dependencies: `zustand`, `react-query`, `react-router-dom`, `axios`.

### 3.2 Authentication & Layout
- [ ] **Login Page**: Simple form to input JWT (dev mode) or integrate Auth provider.
- [ ] **Global Layout**:
    - Sidebar Navigation (Dashboard, Journal, Analytics, Settings).
    - Top Bar (Header).
- [ ] **Auth Guard**: Protect private routes; redirect to `/login` if no token.

### 3.3 Core Logic (Hooks/Utils)
- [ ] **Axios Instance**:
    - Base URL configuration.
    - **Interceptor**: Inject `Authorization: Bearer <token>` automatically.
    - **Interceptor**: Handle 401 (Logout) and 403 (Permission) errors globally.
- [ ] **Global Error Boundary**: Catch React rendering errors and API failures.

## 4. Technical Notes
- Use `Zustand` for storing the auth token.
- Token should be persisted in `localStorage`.
- Ensure clean directory structure: `src/components`, `src/pages`, `src/hooks`, `src/api`.
