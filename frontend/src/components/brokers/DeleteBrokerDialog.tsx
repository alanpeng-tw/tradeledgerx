import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Alert } from '@mui/material';
import type { Broker } from '../../types/broker';
import { useDeleteBroker, getBrokerId } from '../../api/brokers';

interface DeleteBrokerDialogProps {
    open: boolean;
    broker: Broker;
    onClose: () => void;
}

const DeleteBrokerDialog = ({ open, broker, onClose }: DeleteBrokerDialogProps) => {
    const deleteBroker = useDeleteBroker();

    const brokerId = getBrokerId(broker);

    const handleConfirm = async () => {
        if (!brokerId) return;
        try {
            await deleteBroker.mutateAsync(brokerId);
            onClose();
        } catch {
            // Error shown via mutation state
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>停用券商</DialogTitle>
            <DialogContent>
                {deleteBroker.isError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {(deleteBroker.error as Error).message}
                    </Alert>
                )}
                <DialogContentText>
                    確定停用「{broker.name}」（{broker.code}）？停用後將不會出現在帳戶表單的券商選單中，已使用此券商的帳戶資料不受影響。
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>取消</Button>
                <Button color="error" variant="contained" onClick={handleConfirm} disabled={deleteBroker.isPending || !brokerId}>
                    {deleteBroker.isPending ? '處理中…' : '確定停用'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteBrokerDialog;
