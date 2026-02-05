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
import { useForm, Controller } from 'react-hook-form';
import type { AccountCreateInput, AccountType } from '../../types/account';
import { useCreateAccount } from '../../api/accounts';
import { useBrokers } from '../../api/brokers';

const TYPES: { value: AccountType; label: string }[] = [
    { value: 'CHALLENGE', label: 'CHALLENGE（挑戰）' },
    { value: 'LIVE', label: 'LIVE（實盤）' },
];

interface CreateAccountDialogProps {
    open: boolean;
    onClose: () => void;
}

const defaultValues: AccountCreateInput = {
    name: '',
    broker: '',
    type: 'CHALLENGE',
    balance: 0,
    currency: 'USD',
    initial_balance: undefined,
    daily_loss_limit: undefined,
};

const CreateAccountDialog = ({ open, onClose }: CreateAccountDialogProps) => {
    const { data: brokers = [] } = useBrokers();
    const createAccount = useCreateAccount();
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AccountCreateInput>({ defaultValues });

    const onSubmit = async (data: AccountCreateInput) => {
        const payload: AccountCreateInput = {
            name: data.name.trim(),
            broker: data.broker,
            type: data.type,
            balance: Number(data.balance),
            currency: data.currency || 'USD',
        };
        const ib = Number(data.initial_balance);
        if (Number.isFinite(ib)) payload.initial_balance = ib;
        const dl = Number(data.daily_loss_limit);
        if (Number.isFinite(dl)) payload.daily_loss_limit = dl;
        try {
            await createAccount.mutateAsync(payload);
            reset(defaultValues);
            onClose();
        } catch {
            // Error shown via mutation state
        }
    };

    const handleClose = () => {
        reset(defaultValues);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>新增帳戶</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {createAccount.isError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {(createAccount.error as Error).message}
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
                            render={({ field }) => (
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
                                    {brokers.map((b) => (
                                        <MenuItem key={b.id} value={b.code}>
                                            {b.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
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
                                <TextField {...field} label="幣別" fullWidth placeholder="USD" />
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
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>取消</Button>
                    <Button type="submit" variant="contained" disabled={createAccount.isPending}>
                        {createAccount.isPending ? '建立中…' : '建立'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CreateAccountDialog;
