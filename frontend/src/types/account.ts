/** Broker code from GET /api/v1/brokers (e.g. FTMO, BINGX). Backend stores code string. */
export type BrokerCode = string;

/** Align with backend AccountType enum */
export type AccountType = 'CHALLENGE' | 'LIVE';

/** Align with backend AccountStatus enum */
export type AccountStatus = 'ACTIVE' | 'FAILED' | 'CLOSED';

export interface Account {
    id: string;
    name: string;
    broker: BrokerCode;
    type: AccountType;
    balance: number;
    currency: string;
    /** Snapshot of balance at start of day/period or account creation */
    initial_balance?: number;
    /** Percent, e.g. 5.0 */
    daily_loss_limit?: number;
    status?: AccountStatus;
    notes?: string | null;
}

/** Request body for POST /api/v1/accounts */
export interface AccountCreateInput {
    name: string;
    broker: BrokerCode;
    type: AccountType;
    balance: number;
    currency?: string;
    initial_balance?: number;
    daily_loss_limit?: number;
}

/** Request body for PATCH /api/v1/accounts/{id} */
export interface AccountUpdateInput {
    name?: string;
    broker?: BrokerCode;
    type?: AccountType;
    balance?: number;
    initial_balance?: number;
    daily_loss_limit?: number;
    currency?: string;
    status?: AccountStatus;
    notes?: string | null;
}
