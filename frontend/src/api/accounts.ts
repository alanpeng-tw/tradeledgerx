import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from './client';
import type { Account, AccountCreateInput, AccountUpdateInput } from '../types/account';
import { useAccountStore } from '../store/accountStore';
import { useEffect } from 'react';

type RawAccount = Account & { _id?: string };

const normalizeAccount = (account: RawAccount): Account => {
    if (!account.id && account._id) {
        return { ...account, id: account._id };
    }
    return account;
};

export const getAccounts = async (): Promise<Account[]> => {
    const response = await client.get<RawAccount[]>('/accounts');
    return response.data.map(normalizeAccount);
};

export const getAccountById = async (accountId: string): Promise<Account> => {
    const response = await client.get<RawAccount>(`/accounts/${accountId}`);
    return normalizeAccount(response.data);
};

export const createAccount = async (data: AccountCreateInput): Promise<Account> => {
    const response = await client.post<RawAccount>('/accounts', data);
    return normalizeAccount(response.data);
};

export const updateAccount = async (accountId: string, data: AccountUpdateInput): Promise<Account> => {
    const response = await client.patch<RawAccount>(`/accounts/${accountId}`, data);
    return normalizeAccount(response.data);
};

export const deleteAccount = async (accountId: string): Promise<void> => {
    await client.delete(`/accounts/${accountId}`);
};

export const useAccounts = () => {
    const setAccounts = useAccountStore((state) => state.setAccounts);

    const query = useQuery({
        queryKey: ['accounts'],
        queryFn: getAccounts,
        staleTime: Infinity,
    });

    useEffect(() => {
        if (query.isSuccess && query.data) {
            setAccounts(query.data);
        }
    }, [query.isSuccess, query.data, setAccounts]);

    return query;
};

export const useAccountById = (accountId: string | null) => {
    return useQuery({
        queryKey: ['accounts', accountId],
        queryFn: () => getAccountById(accountId!),
        enabled: !!accountId,
    });
};

export const useCreateAccount = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createAccount,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });
};

export const useUpdateAccount = (accountId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: AccountUpdateInput) => updateAccount(accountId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            queryClient.invalidateQueries({ queryKey: ['accounts', accountId] });
        },
    });
};

export const useDeleteAccount = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteAccount,
        onSuccess: (_, deletedId) => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            const { accounts, setAccounts } = useAccountStore.getState();
            const remaining = accounts.filter((a) => a.id !== deletedId);
            setAccounts(remaining);
        },
    });
};
