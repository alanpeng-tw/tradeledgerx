import React, { useCallback, useState } from 'react';
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
    TablePagination,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Link,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    useTradingPlans,
    useCreateTradingPlan,
    useUpdateTradingPlan,
    useDeleteTradingPlan,
} from '../api/tradingPlans';
import type { TradingPlan, TradingPlanCreateInput } from '../types/tradingPlan';
import { useForm, Controller } from 'react-hook-form';

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50];

const TradingPlansPage = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null);
    const [editingPlan, setEditingPlan] = useState<TradingPlan | null>(null);
    const [viewingPlan, setViewingPlan] = useState<TradingPlan | null>(null);
    const [deletingPlan, setDeletingPlan] = useState<TradingPlan | null>(null);

    const { data, isLoading, error } = useTradingPlans(page + 1, rowsPerPage);
    const createPlan = useCreateTradingPlan();
    const updatePlan = useUpdateTradingPlan(editingPlan?.id ?? '');
    const deletePlan = useDeleteTradingPlan();

    const items = data?.items ?? [];
    const total = data?.total ?? 0;

    const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
    const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const openCreate = useCallback(() => {
        setEditingPlan(null);
        setDialogMode('create');
    }, []);
    const openEdit = useCallback((plan: TradingPlan) => {
        setEditingPlan(plan);
        setDialogMode('edit');
    }, []);
    const openView = useCallback((plan: TradingPlan) => setViewingPlan(plan), []);
    const closeView = useCallback(() => setViewingPlan(null), []);
    const closeDialog = useCallback(() => {
        setDialogMode(null);
        setEditingPlan(null);
    }, []);

    const openDelete = useCallback((plan: TradingPlan) => setDeletingPlan(plan), []);
    const closeDelete = useCallback(() => setDeletingPlan(null), []);
    const confirmDelete = useCallback(async () => {
        if (!deletingPlan) return;
        try {
            await deletePlan.mutateAsync(deletingPlan.id);
            closeDelete();
        } catch {
            // error handled by mutation
        }
    }, [deletingPlan, deletePlan, closeDelete]);

    return (
        <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: '100%', overflow: 'auto' }}>
            <Typography variant="h4" component="h1" gutterBottom color="primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                交易規劃
            </Typography>
            <Typography paragraph sx={{ mb: 2 }}>
                管理交易規劃：日期、品種、TradingView 圖檔連結、規劃說明。支援列表與分頁。
            </Typography>

            <Box sx={{ mb: 2 }}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
                    新增規劃
                </Button>
            </Box>

            {isLoading && <CircularProgress size={24} sx={{ mb: 2 }} />}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    無法載入規劃：{(error as Error).message}
                </Alert>
            )}

            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>日期</TableCell>
                            <TableCell>品種</TableCell>
                            <TableCell>TradingView 圖檔連結</TableCell>
                            <TableCell>規劃說明</TableCell>
                            <TableCell align="right">操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {!error && items.length === 0 && !isLoading && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    尚無規劃，請點「新增規劃」建立。
                                </TableCell>
                            </TableRow>
                        )}
                        {items.map((plan) => (
                            <TableRow key={plan.id} hover>
                                <TableCell>{plan.plan_date}</TableCell>
                                <TableCell>{plan.symbol}</TableCell>
                                <TableCell sx={{ maxWidth: 220 }}>
                                    {plan.tradingview_chart_url ? (
                                        <Link href={plan.tradingview_chart_url} target="_blank" rel="noopener noreferrer">
                                            開啟連結
                                        </Link>
                                    ) : '—'}
                                </TableCell>
                                <TableCell sx={{ maxWidth: 280 }} title={plan.description ?? undefined}>
                                    {plan.description
                                        ? plan.description.length > 50
                                            ? `${plan.description.slice(0, 50)}…`
                                            : plan.description
                                        : '—'}
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="檢視">
                                        <IconButton size="small" onClick={() => openView(plan)} aria-label="檢視">
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="編輯">
                                        <IconButton size="small" onClick={() => openEdit(plan)} aria-label="編輯">
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="刪除">
                                        <IconButton size="small" color="error" onClick={() => openDelete(plan)} aria-label="刪除">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {total > 0 && (
                    <TablePagination
                        component="div"
                        count={total}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                        labelRowsPerPage="每頁筆數："
                        labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
                    />
                )}
            </TableContainer>

            {/* View single plan dialog */}
            <Dialog open={!!viewingPlan} onClose={closeView} fullWidth maxWidth="sm">
                {viewingPlan && (
                    <>
                        <DialogTitle>檢視規劃</DialogTitle>
                        <DialogContent sx={{ pt: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>日期</Typography>
                            <Typography paragraph sx={{ mt: 0 }}>{viewingPlan.plan_date}</Typography>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>品種</Typography>
                            <Typography paragraph sx={{ mt: 0 }}>{viewingPlan.symbol}</Typography>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>TradingView 圖檔連結</Typography>
                            {viewingPlan.tradingview_chart_url ? (
                                <Typography paragraph sx={{ mt: 0 }}>
                                    <Link href={viewingPlan.tradingview_chart_url} target="_blank" rel="noopener noreferrer">
                                        {viewingPlan.tradingview_chart_url}
                                    </Link>
                                </Typography>
                            ) : (
                                <Typography paragraph sx={{ mt: 0 }}>—</Typography>
                            )}
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>規劃說明</Typography>
                            <Typography
                                paragraph
                                sx={{
                                    mt: 0,
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    minHeight: 80,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    p: 2,
                                    bgcolor: 'action.hover',
                                }}
                            >
                                {viewingPlan.description || '—'}
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={closeView}>關閉</Button>
                            <Button variant="contained" onClick={() => { openEdit(viewingPlan); closeView(); }}>
                                編輯
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Create / Edit Dialog */}
            {(dialogMode === 'create' || dialogMode === 'edit') && (
                <PlanFormDialog
                    mode={dialogMode}
                    initial={editingPlan ?? undefined}
                    onClose={closeDialog}
                    onCreate={createPlan.mutateAsync}
                    onUpdate={editingPlan ? (data) => updatePlan.mutateAsync(data) : undefined}
                />
            )}

            {/* Delete confirm */}
            <Dialog open={!!deletingPlan} onClose={closeDelete}>
                <DialogTitle>確認刪除</DialogTitle>
                <DialogContent>
                    {deletingPlan && (
                        <Typography>
                            確定要刪除「{deletingPlan.plan_date} - {deletingPlan.symbol}」的規劃嗎？
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDelete}>取消</Button>
                    <Button color="error" variant="contained" onClick={confirmDelete} disabled={deletePlan.isPending}>
                        {deletePlan.isPending ? '刪除中…' : '刪除'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

// --- Form dialog for Create / Edit ---
interface PlanFormDialogProps {
    mode: 'create' | 'edit';
    initial?: TradingPlan;
    onClose: () => void;
    onCreate: (data: TradingPlanCreateInput) => Promise<unknown>;
    onUpdate?: (data: { plan_date?: string; symbol?: string; tradingview_chart_url?: string; description?: string }) => Promise<unknown>;
}

const defaultFormValues: TradingPlanCreateInput = {
    plan_date: new Date().toISOString().slice(0, 10),
    symbol: '',
    tradingview_chart_url: '',
    description: '',
};

const PlanFormDialog = ({ mode, initial, onClose, onCreate, onUpdate }: PlanFormDialogProps) => {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<TradingPlanCreateInput>({
        defaultValues: initial
            ? {
                  plan_date: initial.plan_date,
                  symbol: initial.symbol,
                  tradingview_chart_url: initial.tradingview_chart_url ?? '',
                  description: initial.description ?? '',
              }
            : defaultFormValues,
    });

    React.useEffect(() => {
        if (initial) {
            reset({
                plan_date: initial.plan_date,
                symbol: initial.symbol,
                tradingview_chart_url: initial.tradingview_chart_url ?? '',
                description: initial.description ?? '',
            });
        } else {
            reset({ ...defaultFormValues, plan_date: new Date().toISOString().slice(0, 10) });
        }
    }, [initial, reset]);

    const onSubmit = async (data: TradingPlanCreateInput) => {
        const payload = {
            ...data,
            tradingview_chart_url: data.tradingview_chart_url?.trim() || undefined,
            description: data.description?.trim() || undefined,
        };
        try {
            if (mode === 'create') {
                await onCreate(payload);
            } else if (onUpdate) {
                await onUpdate(payload);
            }
            onClose();
        } catch {
            // mutation error
        }
    };

    return (
        <Dialog open fullWidth maxWidth="sm" onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>{mode === 'create' ? '新增規劃' : '編輯規劃'}</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <Controller
                        name="plan_date"
                        control={control}
                        rules={{ required: '請選擇日期' }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="日期"
                                type="date"
                                fullWidth
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                error={!!errors.plan_date}
                                helperText={errors.plan_date?.message}
                            />
                        )}
                    />
                    <Controller
                        name="symbol"
                        control={control}
                        rules={{ required: '請輸入品種' }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="品種"
                                fullWidth
                                size="small"
                                placeholder="例如 BTCUSDT、EURUSD"
                                error={!!errors.symbol}
                                helperText={errors.symbol?.message}
                            />
                        )}
                    />
                    <Controller
                        name="tradingview_chart_url"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="TradingView 圖檔連結"
                                fullWidth
                                size="small"
                                placeholder="https://..."
                            />
                        )}
                    />
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="規劃說明"
                                fullWidth
                                size="small"
                                multiline
                                minRows={6}
                                maxRows={12}
                                placeholder="請輸入完整規劃說明…"
                            />
                        )}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>取消</Button>
                    <Button type="submit" variant="contained">
                        {mode === 'create' ? '新增' : '儲存'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default TradingPlansPage;
