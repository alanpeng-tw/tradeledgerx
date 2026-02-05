import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Stack,
    Alert,
} from '@mui/material';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { Account, AccountUpdateInput, AccountType, AccountStatus } from '../../types/account';
import { useUpdateAccount } from '../../api/accounts';
import { useBrokers } from '../../api/brokers';

const TYPES: { value: AccountType; label: string }[] = [
    { value: 'CHALLENGE', label: 'CHALLENGE（挑戰）' },
    { value: 'LIVE', label: 'LIVE（實盤）' },
];

const STATUSES: { value: AccountStatus; label: string }[] = [
    { value: 'ACTIVE', label: '啟用' },
    { value: 'FAILED', label: '失敗' },
    { value: 'CLOSED', label: '已關閉' },
];

interface EditAccountDialogProps {
    open: boolean;
    account: Account;
    onClose: () => void;
}

const EditAccountDialog = ({ open, account, onClose }: EditAccountDialogProps) => {
    const { data: brokers = [] } = useBrokers();
    const updateAccount = useUpdateAccount(account.id);
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AccountUpdateInput>({
        defaultValues: {
            name: account.name,
            broker: account.broker,
            type: account.type,
            balance: account.balance,
            currency: account.currency,
            initial_balance: account.initial_balance,
            daily_loss_limit: account.daily_loss_limit,
            status: account.status ?? 'ACTIVE',
            notes: account.notes ?? '',
        },
    });

    useEffect(() => {
        if (open && account) {
            reset({
                name: account.name,
                broker: account.broker,
                type: account.type,
                balance: account.balance,
                currency: account.currency,
                initial_balance: account.initial_balance,
                daily_loss_limit: account.daily_loss_limit,
                status: account.status ?? 'ACTIVE',
                notes: account.notes ?? '',
            });
        }
    }, [open, account, reset]);

    const onSubmit = async (data: AccountUpdateInput) => {
        const payload: AccountUpdateInput = {
            name: data.name?.trim(),
            broker: data.broker,
            type: data.type,
            balance: data.balance != null ? Number(data.balance) : undefined,
            currency: data.currency,
            initial_balance: (() => {
                const n = Number(data.initial_balance);
                return Number.isFinite(n) ? n : undefined;
            })(),
            daily_loss_limit: (() => {
                const n = Number(data.daily_loss_limit);
                return Number.isFinite(n) ? n : undefined;
            })(),
            status: data.status,
            notes: data.notes === '' ? null : data.notes,
        };
        try {
            await updateAccount.mutateAsync(payload);
            onClose();
        } catch {
            // Error shown via mutation state
        }
    };

    const handleClose = () => {
        reset({
            name: account.name,
            broker: account.broker,
            type: account.type,
            balance: account.balance,
            currency: account.currency,
            initial_balance: account.initial_balance,
            daily_loss_limit: account.daily_loss_limit,
            status: account.status ?? 'ACTIVE',
            notes: account.notes ?? '',
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>編輯帳戶：{account.name}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {updateAccount.isError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {(updateAccount.error as Error).message}
                        </Alert>
                    )}
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Controller
                            name="name"
                            control={control}
                            rules={{ required: '名稱為必填' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="名稱"
                                    required
                                    fullWidth
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                />
                            )}
                        />
                        <Controller
                            name="broker"
                            control={control}
                            rules={{ required: '請選擇券商' }}
                            render={({ field }) => {
                                const inList = brokers.some((b) => b.code === field.value);
                                return (
                                    <TextField
                                        {...field}
                                        select
                                        label="券商"
                                        required
                                        fullWidth
                                        error={!!errors.broker}
                                        helperText={errors.broker?.message}
                                        disabled={brokers.length === 0}
                                    >
                                        <MenuItem value="">
                                            <em>{brokers.length === 0 ? '載入中…' : '請選擇券商'}</em>
                                        </MenuItem>
                                        {!inList && field.value ? (
                                            <MenuItem value={field.value}>
                                                {field.value}（已停用）
                                            </MenuItem>
                                        ) : null}
                                        {brokers.map((b) => (
                                            <MenuItem key={b.id} value={b.code}>
                                                {b.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                );
                            }}
                        />
                        <Controller
                            name="type"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <TextField {...field} select label="類型" required fullWidth>
                                    {TYPES.map((t) => (
                                        <MenuItem key={t.value} value={t.value}>
                                            {t.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                        <Controller
                            name="balance"
                            control={control}
                            rules={{
                                required: '餘額為必填',
                                min: { value: 0, message: '餘額不可為負' },
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    type="number"
                                    label="餘額"
                                    required
                                    fullWidth
                                    inputProps={{ min: 0, step: 0.01 }}
                                    error={!!errors.balance}
                                    helperText={errors.balance?.message}
                                    onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                />
                            )}
                        />
                        <Controller
                            name="currency"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="幣別" fullWidth />
                            )}
                        />
                        <Controller
                            name="initial_balance"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    type="number"
                                    label="初始餘額（選填）"
                                    fullWidth
                                    inputProps={{ min: 0, step: 0.01 }}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                />
                            )}
                        />
                        <Controller
                            name="daily_loss_limit"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    type="number"
                                    label="每日虧損上限 %（選填）"
                                    fullWidth
                                    inputProps={{ min: 0, step: 0.1 }}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                />
                            )}
                        />
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} select label="狀態" fullWidth>
                                    {STATUSES.map((s) => (
                                        <MenuItem key={s.value} value={s.value}>
                                            {s.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                        <Controller
                            name="notes"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="備註（例如：爆倉）"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(e.target.value || null)}
                                />
                            )}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>取消</Button>
                    <Button type="submit" variant="contained" disabled={updateAccount.isPending}>
                        {updateAccount.isPending ? '儲存中…' : '儲存'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EditAccountDialog;
