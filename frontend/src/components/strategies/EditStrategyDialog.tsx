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
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { Strategy, StrategyUpdateInput } from '../../types/strategy';
import { useUpdateStrategy } from '../../api/strategies';

interface EditStrategyDialogProps {
    open: boolean;
    strategy: Strategy;
    onClose: () => void;
}

const paramsToJson = (params: Record<string, unknown> | null | undefined): string => {
    if (params == null || Object.keys(params).length === 0) return '';
    try {
        return JSON.stringify(params, null, 2);
    } catch {
        return '';
    }
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

const EditStrategyDialog = ({ open, strategy, onClose }: EditStrategyDialogProps) => {
    const updateStrategy = useUpdateStrategy(strategy.id);
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
        setError,
    } = useForm<StrategyUpdateInput & { parametersJson?: string }>({
        defaultValues: {
            name: strategy.name,
            description: strategy.description ?? '',
            parametersJson: paramsToJson(strategy.parameters ?? undefined),
        },
    });

    useEffect(() => {
        if (open && strategy) {
            reset({
                name: strategy.name,
                description: strategy.description ?? '',
                parametersJson: paramsToJson(strategy.parameters ?? undefined),
            });
        }
    }, [open, strategy, reset]);

    const onSubmit = async (data: StrategyUpdateInput & { parametersJson?: string }) => {
        const params = data.parametersJson ? parseParameters(data.parametersJson) : undefined;
        if (data.parametersJson?.trim() && params === undefined) {
            setError('parametersJson', { type: 'manual', message: '請輸入有效的 JSON' });
            return;
        }
        const payload: StrategyUpdateInput = {
            name: data.name?.trim(),
            description: data.description === '' ? null : data.description,
            parameters: params ?? null,
        };
        try {
            await updateStrategy.mutateAsync(payload);
            onClose();
        } catch {
            // Error shown via mutation state
        }
    };

    const handleClose = () => {
        reset({
            name: strategy.name,
            description: strategy.description ?? '',
            parametersJson: paramsToJson(strategy.parameters ?? undefined),
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>編輯策略：{strategy.name}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {updateStrategy.isError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {(updateStrategy.error as Error).message}
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
                                    error={!!(errors as { parametersJson?: { message?: string } }).parametersJson}
                                    helperText={(errors as { parametersJson?: { message?: string } }).parametersJson?.message}
                                />
                            )}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>取消</Button>
                    <Button type="submit" variant="contained" disabled={updateStrategy.isPending}>
                        {updateStrategy.isPending ? '儲存中…' : '儲存'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EditStrategyDialog;
