import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Chip,
    IconButton,
    Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAccounts } from '../api/accounts';
import type { Account } from '../types/account';
import { useCallback, useState } from 'react';
import CreateAccountDialog from '../components/accounts/CreateAccountDialog';
import EditAccountDialog from '../components/accounts/EditAccountDialog';
import DeleteAccountDialog from '../components/accounts/DeleteAccountDialog';

const statusLabel: Record<string, string> = {
    ACTIVE: '啟用',
    FAILED: '失敗',
    CLOSED: '已關閉',
};

const AccountsPage = () => {
    const { data: accounts = [], isLoading, error } = useAccounts();
    const [createOpen, setCreateOpen] = useState(false);
    const [editAccount, setEditAccount] = useState<Account | null>(null);
    const [deleteAccount, setDeleteAccount] = useState<Account | null>(null);

    const handleCloseCreate = useCallback(() => setCreateOpen(false), []);
    const handleCloseEdit = useCallback(() => setEditAccount(null), []);
    const handleCloseDelete = useCallback(() => setDeleteAccount(null), []);

    return (
        <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: '100%', overflow: 'auto' }}>
            <Typography variant="h4" component="h1" gutterBottom color="primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                帳戶管理
            </Typography>
            <Typography paragraph sx={{ mb: 2 }}>
                新增、編輯或刪除交易帳戶；可設定狀態與備註（例如爆倉）。
            </Typography>

            <Box sx={{ mb: 2 }}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
                    新增帳戶
                </Button>
            </Box>

            {isLoading && <CircularProgress size={24} sx={{ mb: 2 }} />}
            {/* 僅在請求失敗時顯示錯誤；載入成功且無資料（DB 為空）時不顯示錯誤 */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    無法載入帳戶：{(error as Error).message}
                </Alert>
            )}

            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>名稱</TableCell>
                            <TableCell>券商</TableCell>
                            <TableCell>類型</TableCell>
                            <TableCell align="right">餘額</TableCell>
                            <TableCell>幣別</TableCell>
                            <TableCell>狀態</TableCell>
                            <TableCell>備註</TableCell>
                            <TableCell align="right">操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {error && !isLoading && (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 3 }} color="text.secondary">
                                    載入失敗，請檢查網路連線或稍後再試。
                                </TableCell>
                            </TableRow>
                        )}
                        {!error && accounts.length === 0 && !isLoading && (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                    尚無帳戶，請點「新增帳戶」建立。
                                </TableCell>
                            </TableRow>
                        )}
                        {accounts.map((acc) => (
                            <TableRow key={acc.id} hover>
                                <TableCell>{acc.name}</TableCell>
                                <TableCell>{acc.broker}</TableCell>
                                <TableCell>{acc.type}</TableCell>
                                <TableCell align="right">{acc.balance.toLocaleString()}</TableCell>
                                <TableCell>{acc.currency}</TableCell>
                                <TableCell>
                                    {acc.status ? (
                                        <Chip size="small" label={statusLabel[acc.status] ?? acc.status} />
                                    ) : (
                                        '—'
                                    )}
                                </TableCell>
                                <TableCell sx={{ maxWidth: 160 }} title={acc.notes ?? undefined}>
                                    {acc.notes ? (acc.notes.length > 20 ? `${acc.notes.slice(0, 20)}…` : acc.notes) : '—'}
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="編輯">
                                        <IconButton size="small" onClick={() => setEditAccount(acc)} aria-label="編輯">
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="刪除">
                                        <IconButton size="small" color="error" onClick={() => setDeleteAccount(acc)} aria-label="刪除">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <CreateAccountDialog open={createOpen} onClose={handleCloseCreate} />
            {editAccount && <EditAccountDialog open account={editAccount} onClose={handleCloseEdit} />}
            {deleteAccount && <DeleteAccountDialog open account={deleteAccount} onClose={handleCloseDelete} />}
        </Box>
    );
};

export default AccountsPage;
