import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from './client';
import type { Strategy, StrategyCreateInput, StrategyUpdateInput } from '../types/strategy';

type RawStrategy = Strategy & { _id?: string };

const normalizeStrategy = (strategy: RawStrategy): Strategy => {
    if (!strategy.id && strategy._id) {
        return { ...strategy, id: strategy._id };
    }
    return strategy;
};

export const getStrategies = async (): Promise<Strategy[]> => {
    const response = await client.get<RawStrategy[]>('/strategies');
    return response.data.map(normalizeStrategy);
};

export const getStrategyById = async (strategyId: string): Promise<Strategy> => {
    const response = await client.get<RawStrategy>(`/strategies/${strategyId}`);
    return normalizeStrategy(response.data);
};

export const createStrategy = async (data: StrategyCreateInput): Promise<Strategy> => {
    const response = await client.post<RawStrategy>('/strategies', data);
    return normalizeStrategy(response.data);
};

export const updateStrategy = async (strategyId: string, data: StrategyUpdateInput): Promise<Strategy> => {
    const response = await client.patch<RawStrategy>(`/strategies/${strategyId}`, data);
    return normalizeStrategy(response.data);
};

export const deleteStrategy = async (strategyId: string): Promise<void> => {
    await client.delete(`/strategies/${strategyId}`);
};

export const useStrategies = () => {
    return useQuery({
        queryKey: ['strategies'],
        queryFn: getStrategies,
    });
};

export const useStrategyById = (strategyId: string | null) => {
    return useQuery({
        queryKey: ['strategies', strategyId],
        queryFn: () => getStrategyById(strategyId!),
        enabled: !!strategyId,
    });
};

export const useCreateStrategy = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createStrategy,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['strategies'] });
        },
    });
};

export const useUpdateStrategy = (strategyId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: StrategyUpdateInput) => updateStrategy(strategyId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['strategies'] });
            queryClient.invalidateQueries({ queryKey: ['strategies', strategyId] });
        },
    });
};

export const useDeleteStrategy = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteStrategy,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['strategies'] });
        },
    });
};
