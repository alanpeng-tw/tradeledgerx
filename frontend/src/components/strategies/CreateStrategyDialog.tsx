import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    Alert,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import type { StrategyCreateInput } from '../../types/strategy';
import { useCreateStrategy } from '../../api/strategies';

interface CreateStrategyDialogProps {
    open: boolean;
    onClose: () => void;
}

const defaultValues: StrategyCreateInput = {
    name: '',
    description: '',
    parameters: undefined,
};

const parseParameters = (value: string): Record<string, unknown> | undefined => {
    const trimmed = value?.trim();
    if (!trimmed) return undefined;
    try {
        const parsed = JSON.parse(trimmed);
        return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : undefined;
    } catch {
        return undefined;
    }
};

const CreateStrategyDialog = ({ open, onClose }: CreateStrategyDialogProps) => {
    const createStrategy = useCreateStrategy();
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
        setError,
    } = useForm<StrategyCreateInput & { parametersJson?: string }>({ defaultValues: { ...defaultValues, parametersJson: '' } });

    const onSubmit = async (data: StrategyCreateInput & { parametersJson?: string }) => {
        const params = data.parametersJson ? parseParameters(data.parametersJson) : undefined;
        if (data.parametersJson?.trim() && params === undefined) {
            setError('parametersJson', { type: 'manual', message: '請輸入有效的 JSON（例如 {} 或 {"key": "value"}）' });
            return;
        }
        const payload: StrategyCreateInput = {
            name: data.name.trim(),
            description: data.description?.trim() || undefined,
            parameters: params ?? undefined,
        };
        try {
            await createStrategy.mutateAsync(payload);
            reset({ ...defaultValues, parametersJson: '' });
            onClose();
        } catch {
            // Error shown via mutation state
        }
    };

    const handleClose = () => {
        reset({ ...defaultValues, parametersJson: '' });
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>新增策略</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {createStrategy.isError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {(createStrategy.error as Error).message}
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
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="說明（選填）"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={field.value ?? ''}
                                />
                            )}
                        />
                        <Controller
                            name="parametersJson"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="參數（選填，JSON 格式）"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    placeholder='例如 {"atr_period": 14}'
                                    error={!!(errors as { parametersJson?: { message?: string } }).parametersJson}
                                    helperText={(errors as { parametersJson?: { message?: string } }).parametersJson?.message}
                                />
                            )}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>取消</Button>
                    <Button type="submit" variant="contained" disabled={createStrategy.isPending}>
                        {createStrategy.isPending ? '建立中…' : '建立'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CreateStrategyDialog;
