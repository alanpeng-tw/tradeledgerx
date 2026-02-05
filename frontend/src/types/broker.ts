/** Broker from GET /api/v1/brokers (active list for dropdown) */
export interface Broker {
    id: string;
    code: string;
    name: string;
    sort_order: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}
