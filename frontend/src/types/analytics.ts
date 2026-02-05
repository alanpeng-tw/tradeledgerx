export interface DailyPnL {
    date: string; // YYYY-MM-DD
    pnl: number;
    trade_count: number;
}

export interface EquityCurvePoint {
    date: string;
    equity: number;
}

export interface AnalyticsStats {
    win_rate: number; // 0.0 to 1.0 or 0 to 100
    total_trades: number;
    wins: number;
    losses: number;
    breakeven: number;
    equity_curve: EquityCurvePoint[];
}
