# STORY-03-01: Risk API Integration

## 1. Description
Implement the data fetching layer for the Risk Dashboard. This involves calling the backend to get the current day's PnL status and ensuring the data is automatically refreshed or re-fetched when the user switches accounts.

## 2. Goals
- Retrieve accurate risk data from the backend.
- Synchronize data fetching with the global account state.

## 3. Acceptance Criteria
- [ ] **API Client**:
    - Implement `getDailyRiskStatus()` using Axios.
    - Endpoint: `GET /api/v1/risk/daily-status`.
    - **Header**: Automatically handled by the global Interceptor (See `STORY-02-02`).
- [ ] **Data Fetching Hook (`useDailyRisk`)**:
    - Use `useQuery` from React Query.
    - Key: `['risk', 'daily', activeAccountId]`.
    - **Dependency**: The query **must** be disabled (enabled: false) if `activeAccountId` is null.
- [ ] **Data Model (Response)**:
    - `loss_amount`: Number (Absolute value).
    - `loss_percentage`: Number (0-100).
    - `status`: String Enum ('SAFE', 'WARNING', 'DANGER').

## 4. Technical Notes
- **Refetch Strategy**: Consider `refetchOnWindowFocus: true` since risk status is critical.
- **Failures**: If API fails (500/Network), return `null` or error state, but don't crash the UI.
