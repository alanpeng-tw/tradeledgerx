export type TradeType = 'LONG' | 'SHORT';

export interface Trade {
    id: string;
    symbol: string;
    type: TradeType;
    entry_date: string;
    exit_date?: string;
    entry_price: number;
    exit_price?: number;
    pnl?: number;
    pnl_percentage?: number;
    status: 'OPEN' | 'CLOSED';
    notes?: string;
    account_id: string;
    tags?: string[];
}

export interface TradeFilter {
    page: number;
    limit: number;
    account_id?: string;
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}
