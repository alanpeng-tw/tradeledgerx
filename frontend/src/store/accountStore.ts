import { create } from 'zustand';
import type { Account } from '../types/account';

interface AccountState {
    accounts: Account[];
    activeAccountId: string | null;
    setAccounts: (accounts: Account[]) => void;
    setActiveAccount: (id: string) => void;
}

const STORAGE_KEY = 'active_account_id';

export const useAccountStore = create<AccountState>((set) => {
    // Initialize activeAccountId from localStorage (ignore invalid "undefined" string)
    let storedActiveId = localStorage.getItem(STORAGE_KEY);
    if (storedActiveId === 'undefined' || storedActiveId === 'null' || storedActiveId === '') {
        localStorage.removeItem(STORAGE_KEY);
        storedActiveId = null;
    }

    return {
        accounts: [],
        activeAccountId: storedActiveId,

        setAccounts: (accounts: Account[]) => {
            set((state) => {
                let newActiveId = state.activeAccountId;

                // If we have no active ID, or the current active ID is not in the new list
                const isActiveValid = accounts.some((a) => a.id === newActiveId);

                if (!newActiveId || !isActiveValid) {
                    // Default to first account if available
                    if (accounts.length > 0) {
                        newActiveId = accounts[0].id;
                        localStorage.setItem(STORAGE_KEY, newActiveId);
                    } else {
                        newActiveId = null;
                        localStorage.removeItem(STORAGE_KEY);
                    }
                }

                return { accounts, activeAccountId: newActiveId };
            });
        },

        setActiveAccount: (id: string) => {
            localStorage.setItem(STORAGE_KEY, id);
            set({ activeAccountId: id });
        },
    };
});
