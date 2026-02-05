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
    IconButton,
    Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useStrategies } from '../api/strategies';
import type { Strategy } from '../types/strategy';
import { useCallback, useState } from 'react';
import CreateStrategyDialog from '../components/strategies/CreateStrategyDialog';
import EditStrategyDialog from '../components/strategies/EditStrategyDialog';
import DeleteStrategyDialog from '../components/strategies/DeleteStrategyDialog';

const StrategiesPage = () => {
    const { data: strategies = [], isLoading, error } = useStrategies();
    const [createOpen, setCreateOpen] = useState(false);
    const [editStrategy, setEditStrategy] = useState<Strategy | null>(null);
    const [deleteStrategy, setDeleteStrategy] = useState<Strategy | null>(null);

    const handleCloseCreate = useCallback(() => setCreateOpen(false), []);
    const handleCloseEdit = useCallback(() => setEditStrategy(null), []);
    const handleCloseDelete = useCallback(() => setDeleteStrategy(null), []);

    const formatParams = (params: Record<string, unknown> | null | undefined): string => {
        if (params == null || Object.keys(params).length === 0) return '—';
        try {
            return JSON.stringify(params);
        } catch {
            return '—';
        }
    };

    return (
        <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: '100%', overflow: 'auto' }}>
            <Typography variant="h4" component="h1" gutterBottom color="primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                交易策略管理
            </Typography>
            <Typography paragraph sx={{ mb: 2 }}>
                新增、編輯或刪除交易策略（策略名稱、說明、參數）。
            </Typography>

            <Box sx={{ mb: 2 }}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
                    新增策略
                </Button>
            </Box>

            {isLoading && <CircularProgress size={24} sx={{ mb: 2 }} />}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    無法載入策略：{(error as Error).message}
                </Alert>
            )}

            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>名稱</TableCell>
                            <TableCell>說明</TableCell>
                            <TableCell>參數</TableCell>
                            <TableCell align="right">操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {!error && strategies.length === 0 && !isLoading && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                    尚無策略，請點「新增策略」建立。
                                </TableCell>
                            </TableRow>
                        )}
                        {strategies.map((s) => (
                            <TableRow key={s.id} hover>
                                <TableCell>{s.name}</TableCell>
                                <TableCell sx={{ maxWidth: 200 }} title={s.description ?? undefined}>
                                    {s.description ? (s.description.length > 40 ? `${s.description.slice(0, 40)}…` : s.description) : '—'}
                                </TableCell>
                                <TableCell sx={{ maxWidth: 200 }} title={formatParams(s.parameters ?? undefined)}>
                                    {s.parameters && Object.keys(s.parameters).length > 0
                                        ? (JSON.stringify(s.parameters).length > 30
                                            ? `${JSON.stringify(s.parameters).slice(0, 30)}…`
                                            : JSON.stringify(s.parameters))
                                        : '—'}
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="編輯">
                                        <IconButton size="small" onClick={() => setEditStrategy(s)} aria-label="編輯">
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="刪除">
                                        <IconButton size="small" color="error" onClick={() => setDeleteStrategy(s)} aria-label="刪除">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <CreateStrategyDialog open={createOpen} onClose={handleCloseCreate} />
            {editStrategy && <EditStrategyDialog open strategy={editStrategy} onClose={handleCloseEdit} />}
            {deleteStrategy && <DeleteStrategyDialog open strategy={deleteStrategy} onClose={handleCloseDelete} />}
        </Box>
    );
};

export default StrategiesPage;
