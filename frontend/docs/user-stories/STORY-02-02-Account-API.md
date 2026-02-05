# STORY-02-02: Account API Integration

## 1. Description
Connect the frontend to the backend API to retrieve account data and ensure all subsequent requests are scoped to the correct account context.

## 2. Goals
- Fetch real account data from the server.
- Enforce data isolation by sending the Account ID with every request.

## 3. Acceptance Criteria
- [ ] **API Client**:
    - Implement `getAccounts()` function using Axios.
    - Endpoint: `GET /api/v1/accounts`.
- [ ] **Authentication Integration**:
    - Ensure `getAccounts()` is called only *after* login is successful.
- [ ] **Axios Interceptor**:
    - Create/Update Request Interceptor.
    - Retrieve `activeAccountId` from the Store.
    - If valid, append header: `X-Account-ID: <uuid>`.
    - **Verify**: Inspect Network tab to confirm header presence on calls like `GET /api/v1/trades`.

## 4. Technical Notes
- Use `React Query` (`useQuery`) to fetch accounts.
- Key: `['accounts']`.
- Config: `staleTime: Infinity` (Accounts rarely change during a session).
