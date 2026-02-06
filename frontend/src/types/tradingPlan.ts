export interface TradingPlan {
    id: string;
    account_id: string;
    plan_date: string; // YYYY-MM-DD
    symbol: string;
    tradingview_chart_url?: string | null;
    description?: string | null;
}

export interface TradingPlanListResponse {
    items: TradingPlan[];
    total: number;
    skip: number;
    limit: number;
}

export interface TradingPlanCreateInput {
    plan_date: string;
    symbol: string;
    tradingview_chart_url?: string;
    description?: string;
}

export interface TradingPlanUpdateInput {
    plan_date?: string;
    symbol?: string;
    tradingview_chart_url?: string;
    description?: string;
}
