import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from './client';
import type { Tag } from '../types/tag';

export const getTags = async (): Promise<Tag[]> => {
    const response = await client.get<Tag[]>('/tags');
    return response.data;
};

export const createTag = async (data: Omit<Tag, 'id'>): Promise<Tag> => {
    const response = await client.post<Tag>('/tags', data);
    return response.data;
};

export const updateTag = async (id: string, data: Partial<Omit<Tag, 'id'>>): Promise<Tag> => {
    const response = await client.put<Tag>(`/tags/${id}`, data);
    return response.data;
};

export const deleteTag = async (id: string): Promise<void> => {
    await client.delete(`/tags/${id}`);
};

export const useTags = () => {
    return useQuery({
        queryKey: ['tags'],
        queryFn: getTags,
        staleTime: 60 * 60 * 1000,
        gcTime: 24 * 60 * 60 * 1000,
    });
};

export const useCreateTag = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createTag,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
        },
    });
};

export const useUpdateTag = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Tag, 'id'>> }) => updateTag(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
        },
    });
};

export const useDeleteTag = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteTag,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
        },
    });
};
