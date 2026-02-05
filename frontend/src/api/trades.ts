import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import client from './client';
import type { Trade, TradeFilter, PaginatedResponse } from '../types/trade';

export const getTrades = async (filter: TradeFilter): Promise<PaginatedResponse<Trade>> => {
    const params = new URLSearchParams();
    params.append('page', filter.page.toString());
    params.append('limit', filter.limit.toString());

    // account_id is passed via X-Account-ID header; no query param needed
    if (filter.sort_by) {
        params.append('sort_by', filter.sort_by);
    }
    if (filter.sort_direction) {
        params.append('sort_direction', filter.sort_direction);
    }

    const response = await client.get<PaginatedResponse<Trade>>(`/trades?${params.toString()}`);
    return response.data;
};

export interface TradeCreateInput {
    symbol: string;
    direction: 'LONG' | 'SHORT';
    entry_date: string; // ISO datetime
    entry_price: number;
    quantity: number;
    sl?: number;
    tp?: number;
    exit_date?: string;
    exit_price?: number;
    status?: 'OPEN' | 'CLOSED' | 'PENDING';
    notes?: string;
    tags?: string[];
}

export const createTrade = async (data: TradeCreateInput): Promise<Trade> => {
    const response = await client.post<Trade>('/trades', data);
    return response.data;
};

export const deleteTrade = async (id: string): Promise<void> => {
    await client.delete(`/trades/${id}`);
};

export const useTrades = (filter: TradeFilter, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ['trades', filter],
        queryFn: () => getTrades(filter),
        placeholderData: keepPreviousData,
        enabled: options?.enabled ?? true,
    });
};

export const useCreateTrade = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createTrade,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trades'] });
            queryClient.invalidateQueries({ queryKey: ['risk'] });
        },
    });
};

export const useDeleteTrade = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteTrade,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trades'] });
            // Also invalidate risk data as deleting a trade affects PnL
            queryClient.invalidateQueries({ queryKey: ['risk'] });
        },
    });
};
