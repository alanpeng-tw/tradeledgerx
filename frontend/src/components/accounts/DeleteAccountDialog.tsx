import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Alert } from '@mui/material';
import type { Account } from '../../types/account';
import { useDeleteAccount } from '../../api/accounts';

interface DeleteAccountDialogProps {
    open: boolean;
    account: Account;
    onClose: () => void;
}

const DeleteAccountDialog = ({ open, account, onClose }: DeleteAccountDialogProps) => {
    const deleteAccount = useDeleteAccount();

    const handleConfirm = async () => {
        try {
            await deleteAccount.mutateAsync(account.id);
            onClose();
        } catch {
            // Error shown via mutation state below
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>刪除帳戶</DialogTitle>
            <DialogContent>
                {deleteAccount.isError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {(deleteAccount.error as Error).message}
                    </Alert>
                )}
                <DialogContentText>
                    確定刪除此帳戶？「{account.name}」({account.broker}) 將被永久刪除，此操作無法復原。
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>取消</Button>
                <Button color="error" variant="contained" onClick={handleConfirm} disabled={deleteAccount.isPending}>
                    {deleteAccount.isPending ? '刪除中…' : '確定刪除'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteAccountDialog;
