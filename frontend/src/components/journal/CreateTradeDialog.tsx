import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useCreateTrade, type TradeCreateInput } from '../../api/trades';

interface CreateTradeDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const defaultValues: Partial<TradeCreateInput> = {
    symbol: '',
    direction: 'LONG',
    entry_price: 0,
    quantity: 0,
    sl: undefined,
    tp: undefined,
    notes: '',
};

export default function CreateTradeDialog({ open, onClose, onSuccess }: CreateTradeDialogProps) {
    const [submitError, setSubmitError] = useState<string | null>(null);
    const createMutation = useCreateTrade();

    const { control, handleSubmit, reset, formState: { errors } } = useForm<TradeCreateInput>({
        defaultValues: {
            ...defaultValues,
            entry_date: new Date().toISOString().slice(0, 16),
        },
    });

    const handleClose = () => {
        reset({ ...defaultValues, entry_date: new Date().toISOString().slice(0, 16) });
        setSubmitError(null);
        onClose();
    };

    const onSubmit = async (data: TradeCreateInput) => {
        setSubmitError(null);
        try {
            await createMutation.mutateAsync({
                ...data,
                entry_date: new Date(data.entry_date).toISOString(),
            });
            onSuccess?.();
            handleClose();
        } catch (err: unknown) {
            const msg = err && typeof err === 'object' && 'response' in err
                ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
                : null;
            setSubmitError(typeof msg === 'string' ? msg : '新增交易失敗');
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>新增交易</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="symbol"
                                control={control}
                                rules={{ required: '請輸入商品代碼' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="商品"
                                        fullWidth
                                        size="small"
                                        error={!!errors.symbol}
                                        helperText={errors.symbol?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="direction"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth size="small">
                                        <InputLabel>方向</InputLabel>
                                        <Select {...field} label="方向">
                                            <MenuItem value="LONG">做多</MenuItem>
                                            <MenuItem value="SHORT">做空</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="entry_date"
                                control={control}
                                rules={{ required: '請選擇進場時間' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="進場時間"
                                        type="datetime-local"
                                        fullWidth
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                        error={!!errors.entry_date}
                                        helperText={errors.entry_date?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="entry_price"
                                control={control}
                                rules={{ required: '請輸入進場價', min: { value: 0, message: '需大於等於 0' } }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="進場價"
                                        type="number"
                                        fullWidth
                                        size="small"
                                        inputProps={{ step: 0.01, min: 0 }}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        error={!!errors.entry_price}
                                        helperText={errors.entry_price?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="quantity"
                                control={control}
                                rules={{ required: '請輸入數量', min: { value: 0.0001, message: '需大於 0' } }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="數量"
                                        type="number"
                                        fullWidth
                                        size="small"
                                        inputProps={{ step: 0.0001, min: 0 }}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        error={!!errors.quantity}
                                        helperText={errors.quantity?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="sl"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="停損 (選填)"
                                        type="number"
                                        fullWidth
                                        size="small"
                                        value={field.value ?? ''}
                                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                                        inputProps={{ step: 0.01 }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="tp"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="停利 (選填)"
                                        type="number"
                                        fullWidth
                                        size="small"
                                        value={field.value ?? ''}
                                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                                        inputProps={{ step: 0.01 }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={12}>
                            <Controller
                                name="notes"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="備註 (選填)" fullWidth size="small" multiline rows={2} />
                                )}
                            />
                        </Grid>
                        {submitError && (
                            <Grid size={12}>
                                <Button color="error" size="small" disabled>{submitError}</Button>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>取消</Button>
                    <Button type="submit" variant="contained" disabled={createMutation.isPending}>
                        {createMutation.isPending ? '送出中…' : '新增'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
