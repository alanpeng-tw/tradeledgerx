/** Align with backend TradingStrategy (GET /api/v1/strategies) */
export interface Strategy {
    id: string;
    name: string;
    description?: string | null;
    /** Optional key-value / JSON params */
    parameters?: Record<string, unknown> | null;
    created_at?: string | null;
    updated_at?: string | null;
}

/** Request body for POST /api/v1/strategies */
export interface StrategyCreateInput {
    name: string;
    description?: string | null;
    parameters?: Record<string, unknown> | null;
}

/** Request body for PATCH /api/v1/strategies/{id} */
export interface StrategyUpdateInput {
    name?: string;
    description?: string | null;
    parameters?: Record<string, unknown> | null;
}
