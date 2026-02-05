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
import { useForm, Controller } from 'react-hook-form';
import type { BrokerCreateInput } from '../../api/brokers';
import { useCreateBroker } from '../../api/brokers';

interface CreateBrokerDialogProps {
    open: boolean;
    onClose: () => void;
}

const defaultValues: BrokerCreateInput = {
    code: '',
    name: '',
    sort_order: 0,
    is_active: true,
};

const CreateBrokerDialog = ({ open, onClose }: CreateBrokerDialogProps) => {
    const createBroker = useCreateBroker();
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<BrokerCreateInput>({ defaultValues });

    const onSubmit = async (data: BrokerCreateInput) => {
        try {
            await createBroker.mutateAsync({
                code: data.code.trim().toUpperCase(),
                name: data.name.trim(),
                sort_order: data.sort_order ?? 0,
                is_active: data.is_active ?? true,
            });
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
            <DialogTitle>新增券商</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {createBroker.isError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {(createBroker.error as Error).message}
                        </Alert>
                    )}
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Controller
                            name="code"
                            control={control}
                            rules={{ required: '代碼為必填' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="代碼"
                                    required
                                    fullWidth
                                    placeholder="例如 FTMO, MCF"
                                    error={!!errors.code}
                                    helperText={errors.code?.message}
                                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                />
                            )}
                        />
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
                    <Button type="submit" variant="contained" disabled={createBroker.isPending}>
                        {createBroker.isPending ? '建立中…' : '建立'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CreateBrokerDialog;
