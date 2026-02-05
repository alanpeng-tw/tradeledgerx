import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Alert } from '@mui/material';
import type { Strategy } from '../../types/strategy';
import { useDeleteStrategy } from '../../api/strategies';

interface DeleteStrategyDialogProps {
    open: boolean;
    strategy: Strategy;
    onClose: () => void;
}

const DeleteStrategyDialog = ({ open, strategy, onClose }: DeleteStrategyDialogProps) => {
    const deleteStrategy = useDeleteStrategy();

    const handleConfirm = async () => {
        try {
            await deleteStrategy.mutateAsync(strategy.id);
            onClose();
        } catch {
            // Error shown via mutation state
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>刪除策略</DialogTitle>
            <DialogContent>
                {deleteStrategy.isError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {(deleteStrategy.error as Error).message}
                    </Alert>
                )}
                <DialogContentText>
                    確定刪除此策略？「{strategy.name}」將被永久刪除，此操作無法復原。
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>取消</Button>
                <Button color="error" variant="contained" onClick={handleConfirm} disabled={deleteStrategy.isPending}>
                    {deleteStrategy.isPending ? '刪除中…' : '確定刪除'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteStrategyDialog;
