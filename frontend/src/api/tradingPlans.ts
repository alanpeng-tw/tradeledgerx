import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from './client';
import type {
    TradingPlan,
    TradingPlanListResponse,
    TradingPlanCreateInput,
    TradingPlanUpdateInput,
} from '../types/tradingPlan';

type RawPlan = TradingPlan & { _id?: string };

const normalizePlan = (p: RawPlan): TradingPlan => ({
    ...p,
    id: p.id ?? (p._id as string) ?? '',
});

export const getTradingPlans = async (skip: number, limit: number): Promise<TradingPlanListResponse> => {
    const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    const response = await client.get<{ items: RawPlan[]; total: number; skip: number; limit: number }>(
        `/trading-plans?${params}`
    );
    return {
        ...response.data,
        items: response.data.items.map(normalizePlan),
    };
};

export const getTradingPlanById = async (id: string): Promise<TradingPlan> => {
    const response = await client.get<RawPlan>(`/trading-plans/${id}`);
    return normalizePlan(response.data);
};

export const createTradingPlan = async (data: TradingPlanCreateInput): Promise<TradingPlan> => {
    const response = await client.post<RawPlan>('/trading-plans', data);
    return normalizePlan(response.data);
};

export const updateTradingPlan = async (id: string, data: TradingPlanUpdateInput): Promise<TradingPlan> => {
    const response = await client.patch<RawPlan>(`/trading-plans/${id}`, data);
    return normalizePlan(response.data);
};

export const deleteTradingPlan = async (id: string): Promise<void> => {
    await client.delete(`/trading-plans/${id}`);
};

export const useTradingPlans = (page: number, limit: number) => {
    const skip = (page - 1) * limit;
    return useQuery({
        queryKey: ['trading-plans', skip, limit],
        queryFn: () => getTradingPlans(skip, limit),
    });
};

export const useTradingPlanById = (id: string | null) => {
    return useQuery({
        queryKey: ['trading-plans', id],
        queryFn: () => getTradingPlanById(id!),
        enabled: !!id,
    });
};

export const useCreateTradingPlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createTradingPlan,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trading-plans'] }),
    });
};

export const useUpdateTradingPlan = (id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: TradingPlanUpdateInput) => updateTradingPlan(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trading-plans'] }),
    });
};

export const useDeleteTradingPlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteTradingPlan,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trading-plans'] }),
    });
};
