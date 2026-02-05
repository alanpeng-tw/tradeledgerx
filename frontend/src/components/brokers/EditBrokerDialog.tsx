import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    Alert,
    FormControlLabel,
    Checkbox,
} from '@mui/material';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { Broker } from '../../types/broker';
import type { BrokerUpdateInput } from '../../api/brokers';
import { useUpdateBroker, getBrokerId } from '../../api/brokers';

interface EditBrokerDialogProps {
    open: boolean;
    broker: Broker;
    onClose: () => void;
}

const EditBrokerDialog = ({ open, broker, onClose }: EditBrokerDialogProps) => {
    const brokerId = getBrokerId(broker);
    const updateBroker = useUpdateBroker(brokerId);
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<BrokerUpdateInput>({
        defaultValues: {
            name: broker.name,
            sort_order: broker.sort_order,
            is_active: broker.is_active,
        },
    });

    useEffect(() => {
        if (open && broker) {
            reset({
                name: broker.name,
                sort_order: broker.sort_order,
                is_active: broker.is_active,
            });
        }
    }, [open, broker, reset]);

    const onSubmit = async (data: BrokerUpdateInput) => {
        if (!brokerId) {
            return;
        }
        const sortOrder = typeof data.sort_order === 'number' ? data.sort_order : Number(data.sort_order);
        const payload: BrokerUpdateInput = {
            name: data.name?.trim(),
            sort_order: Number.isFinite(sortOrder) ? sortOrder : undefined,
            is_active: data.is_active,
        };
        try {
            await updateBroker.mutateAsync(payload);
            onClose();
        } catch {
            // Error shown via mutation state
        }
    };

    const handleClose = () => {
        reset({
            name: broker.name,
            sort_order: broker.sort_order,
            is_active: broker.is_active,
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>編輯券商：{broker.code}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {updateBroker.isError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {(updateBroker.error as Error).message}
                        </Alert>
                    )}
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField label="代碼" value={broker.code} fullWidth disabled size="small" />
                        <Controller
                            name="name"
                            control={control}
                            rules={{ required: '名稱為必填' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="名稱（顯示用）"
                                    required
                                    fullWidth
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                />
                            )}
                        />
                        <Controller
                            name="sort_order"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    type="number"
                                    label="排序"
                                    fullWidth
                                    inputProps={{ min: 0 }}
                                    value={field.value ?? 0}
                                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                />
                            )}
                        />
                        <Controller
                            name="is_active"
                            control={control}
                            render={({ field }) => (
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={field.value ?? true}
                                            onChange={(_, checked) => field.onChange(checked)}
                                        />
                                    }
                                    label="啟用"
                                />
                            )}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>取消</Button>
                    <Button type="submit" variant="contained" disabled={updateBroker.isPending || !brokerId}>
                        {updateBroker.isPending ? '儲存中…' : '儲存'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EditBrokerDialog;
