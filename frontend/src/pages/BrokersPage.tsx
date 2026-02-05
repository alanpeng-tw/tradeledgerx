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
import { useBrokersAll } from '../api/brokers';
import { useAuthStore } from '../store/authStore';
import type { Broker } from '../types/broker';
import { useCallback, useState } from 'react';
import CreateBrokerDialog from '../components/brokers/CreateBrokerDialog';
import EditBrokerDialog from '../components/brokers/EditBrokerDialog';
import DeleteBrokerDialog from '../components/brokers/DeleteBrokerDialog';

const BrokersPage = () => {
    const { data: brokers = [], isLoading, error } = useBrokersAll();
    const role = useAuthStore((s) => s.role);
    const isAdmin = role === 'admin';
    const [createOpen, setCreateOpen] = useState(false);
    const [editBroker, setEditBroker] = useState<Broker | null>(null);
    const [deleteBroker, setDeleteBroker] = useState<Broker | null>(null);

    const handleCloseCreate = useCallback(() => setCreateOpen(false), []);
    const handleCloseEdit = useCallback(() => setEditBroker(null), []);
    const handleCloseDelete = useCallback(() => setDeleteBroker(null), []);

    return (
        <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: '100%', overflow: 'auto' }}>
            <Typography variant="h4" component="h1" gutterBottom color="primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                券商管理
            </Typography>
            <Typography paragraph sx={{ mb: 2 }}>
                檢視支援的券商；管理員可新增、編輯或停用券商，帳戶表單的券商選單會同步更新。
            </Typography>

            {isAdmin && (
                <Box sx={{ mb: 2 }}>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
                        新增券商
                    </Button>
                </Box>
            )}

            {isLoading && <CircularProgress size={24} sx={{ mb: 2 }} />}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    無法載入券商：{(error as Error).message}
                </Alert>
            )}

            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>代碼</TableCell>
                            <TableCell>名稱</TableCell>
                            <TableCell align="right">排序</TableCell>
                            <TableCell>狀態</TableCell>
                            {isAdmin && <TableCell align="right">操作</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {!error && brokers.length === 0 && !isLoading && (
                            <TableRow>
                                <TableCell colSpan={isAdmin ? 5 : 4} align="center" sx={{ py: 3 }}>
                                    尚無券商資料。
                                </TableCell>
                            </TableRow>
                        )}
                        {brokers.map((b) => (
                            <TableRow key={b.id} hover>
                                <TableCell>{b.code}</TableCell>
                                <TableCell>{b.name}</TableCell>
                                <TableCell align="right">{b.sort_order}</TableCell>
                                <TableCell>
                                    <Chip size="small" label={b.is_active ? '啟用' : '停用'} color={b.is_active ? 'success' : 'default'} />
                                </TableCell>
                                {isAdmin && (
                                    <TableCell align="right">
                                        <Tooltip title="編輯">
                                            <IconButton size="small" onClick={() => setEditBroker(b)} aria-label="編輯">
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="停用">
                                            <IconButton size="small" color="error" onClick={() => setDeleteBroker(b)} aria-label="停用">
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <CreateBrokerDialog open={createOpen} onClose={handleCloseCreate} />
            {editBroker && <EditBrokerDialog open broker={editBroker} onClose={handleCloseEdit} />}
            {deleteBroker && <DeleteBrokerDialog open broker={deleteBroker} onClose={handleCloseDelete} />}
        </Box>
    );
};

export default BrokersPage;
