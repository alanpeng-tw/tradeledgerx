import { useQuery } from '@tanstack/react-query';
import client from './client';
import type { DailyRiskSummary } from '../types/risk';
import { useAccountStore } from '../store/accountStore';

export const getDailyRiskStatus = async (): Promise<DailyRiskSummary> => {
    const response = await client.get<DailyRiskSummary>('/risk/daily-status');
    return response.data;
};

export const useDailyRisk = () => {
    const activeAccountId = useAccountStore((state) => state.activeAccountId);

    return useQuery({
        queryKey: ['risk', 'daily', activeAccountId],
        queryFn: getDailyRiskStatus,
        enabled: !!activeAccountId,
        refetchOnWindowFocus: true,
    });
};
