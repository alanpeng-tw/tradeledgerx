import { useQuery } from '@tanstack/react-query';
import client from './client';
import type { DailyPnL, AnalyticsStats } from '../types/analytics';
import { useAccountStore } from '../store/accountStore';

const toYearMonth = (year: number, month: number) => {
    const mm = String(month).padStart(2, '0');
    return `${year}-${mm}`;
};

export const getPnLCalendar = async (year: number, month: number): Promise<DailyPnL[]> => {
    const params = new URLSearchParams();
    params.append('month', toYearMonth(year, month));

    const response = await client.get<DailyPnL[]>(`/analytics/calendar?${params.toString()}`);
    return response.data;
};

export const usePnLCalendar = (date: Date) => {
    const activeAccountId = useAccountStore((state) => state.activeAccountId);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-12

    return useQuery({
        queryKey: ['analytics', 'calendar', activeAccountId, year, month],
        queryFn: () => getPnLCalendar(year, month),
        enabled: !!activeAccountId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const getAnalyticsStats = async (period: string = 'all'): Promise<AnalyticsStats> => {
    const params = new URLSearchParams();
    params.append('period', period);

    const response = await client.get<AnalyticsStats>(`/analytics/stats?${params.toString()}`);
    return response.data;
};

export const useAnalyticsStats = (period: string = 'all') => {
    const activeAccountId = useAccountStore((state) => state.activeAccountId);

    return useQuery({
        queryKey: ['analytics', 'stats', activeAccountId, period],
        queryFn: () => getAnalyticsStats(period),
        enabled: !!activeAccountId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
