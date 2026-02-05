import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from './client';
import type { Broker } from '../types/broker';

/** Backend may return id as "id" or "_id"; use this for PATCH/DELETE path. */
export function getBrokerId(broker: Broker): string {
    return (broker as { id?: string; _id?: string }).id ?? (broker as { _id?: string })._id ?? '';
}

type RawBroker = Broker & { _id?: string };

const normalizeBroker = (broker: RawBroker): Broker => {
    if (!broker.id && broker._id) {
        return { ...broker, id: broker._id };
    }
    return broker;
};

export const getBrokers = async (): Promise<Broker[]> => {
    const response = await client.get<RawBroker[]>('/brokers');
    return response.data.map(normalizeBroker);
};

/** List all brokers (active + inactive). For admin 券商管理 UI. Backend returns all when ?all=true and user is admin. */
export const getBrokersAll = async (): Promise<Broker[]> => {
    const response = await client.get<RawBroker[]>('/brokers', { params: { all: true } });
    return response.data.map(normalizeBroker);
};

export interface BrokerCreateInput {
    code: string;
    name: string;
    sort_order?: number;
    is_active?: boolean;
}

export interface BrokerUpdateInput {
    name?: string;
    sort_order?: number;
    is_active?: boolean;
}

export const createBroker = async (data: BrokerCreateInput): Promise<Broker> => {
    const response = await client.post<RawBroker>('/brokers', data);
    return normalizeBroker(response.data);
};

export const updateBroker = async (brokerId: string, data: BrokerUpdateInput): Promise<Broker> => {
    const response = await client.patch<RawBroker>(`/brokers/${brokerId}`, data);
    return normalizeBroker(response.data);
};

export const deleteBroker = async (brokerId: string): Promise<void> => {
    await client.delete(`/brokers/${brokerId}`);
};

export const useBrokers = () => {
    return useQuery({
        queryKey: ['brokers'],
        queryFn: getBrokers,
        staleTime: 5 * 60 * 1000, // 5 min
    });
};

/** Use for 券商管理 page: list all brokers (admin sees all). */
export const useBrokersAll = () => {
    return useQuery({
        queryKey: ['brokers', 'all'],
        queryFn: getBrokersAll,
    });
};

export const useCreateBroker = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createBroker,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brokers'] });
        },
    });
};

export const useUpdateBroker = (brokerId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: BrokerUpdateInput) => updateBroker(brokerId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brokers'] });
        },
    });
};

export const useDeleteBroker = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteBroker,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brokers'] });
        },
    });
};
