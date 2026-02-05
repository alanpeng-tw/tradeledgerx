export type RiskStatus = 'SAFE' | 'WARNING' | 'DANGER';

export const RiskStatus = {
    SAFE: 'SAFE',
    WARNING: 'WARNING',
    DANGER: 'DANGER',
} as const;

export interface DailyRiskSummary {
    loss_amount: number;
    loss_percentage: number;
    status: RiskStatus;
}
