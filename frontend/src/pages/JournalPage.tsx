import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Alert, Snackbar } from '@mui/material';
import { type GridPaginationModel, type GridSortModel } from '@mui/x-data-grid';
import TradeDatagrid from '../components/journal/TradeDatagrid';
import CreateTradeDialog from '../components/journal/CreateTradeDialog';
import { useTrades, useDeleteTrade } from '../api/trades';
import { useAccountStore } from '../store/accountStore';

const JournalPage = () => {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const activeAccountId = useAccountStore((state) => state.activeAccountId);
    const accounts = useAccountStore((state) => state.accounts);
    const setActiveAccount = useAccountStore((state) => state.setActiveAccount);

    // Pagination State
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 25,
    });

    // Sort State
    const [sortModel, setSortModel] = useState<GridSortModel>([]);

    // Determine sort params
    const sortBy = sortModel.length > 0 ? sortModel[0].field : undefined;
    const sortDir = sortModel.length > 0 ? sortModel[0].sort : undefined;

    useEffect(() => {
        if (!activeAccountId && accounts.length > 0) {
            setActiveAccount(accounts[0].id);
        }
    }, [activeAccountId, accounts, setActiveAccount]);

    const effectiveAccountId = activeAccountId || (accounts.length > 0 ? accounts[0].id : null);
    const hasValidAccount = Boolean(effectiveAccountId && effectiveAccountId !== 'undefined');

    // Fetch Trades (only when an account is selected)
    const { data, isLoading, error } = useTrades(
        {
            page: paginationModel.page + 1,
            limit: paginationModel.pageSize,
            account_id: hasValidAccount ? effectiveAccountId ?? undefined : undefined,
            sort_by: sortBy,
            sort_direction: sortDir as 'asc' | 'desc' | undefined,
        },
        { enabled: hasValidAccount }
    );

    const deleteMutation = useDeleteTrade();
    const [toastOpen, setToastOpen] = useState(false);

    const handleDelete = async (id: string) => {
        if (window.confirm('確定要刪除這筆交易嗎？')) {
            try {
                await deleteMutation.mutateAsync(id);
                setToastOpen(true);
            } catch (error) {
                console.error('Failed to delete trade', error);
                alert('刪除交易失敗');
            }
        }
    };

    const handleEdit = (id: string) => {
        console.log('Edit trade', id);
        // Will implement navigation in STORY-04-02
        alert(`編輯交易 ${id}（即將推出）`);
    };

    return (
        <Box sx={{ p: { xs: 0, sm: 2 }, height: { xs: 'auto', sm: 'calc(100vh - 80px)' }, minHeight: 400, display: 'flex', flexDirection: 'column', maxWidth: '100%', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 2 }}>
                <Typography variant="h4" component="h1" color="primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    交易日誌
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    size="medium"
                    sx={{ alignSelf: { xs: 'stretch', sm: 'inherit' } }}
                    onClick={() => setCreateDialogOpen(true)}
                    disabled={!hasValidAccount}
                >
                    新增交易
                </Button>
            </Box>

            {!hasValidAccount ? (
                <Alert severity="info" sx={{ mb: 2 }}>請在右上角「選擇帳戶」中選擇一個帳戶以檢視交易日誌。</Alert>
            ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>載入交易資料時發生錯誤：{(error as Error).message}</Alert>
            ) : null}

            <Paper sx={{ flexGrow: 1, bgcolor: 'background.paper', p: 0, overflow: 'auto', minHeight: 300 }}>
                <TradeDatagrid
                    rows={data?.data || []}
                    rowCount={data?.total || 0}
                    loading={isLoading}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    onSortModelChange={setSortModel}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                />
            </Paper>

            <CreateTradeDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
            />

            <Snackbar
                open={toastOpen}
                autoHideDuration={6000}
                onClose={() => setToastOpen(false)}
                message="交易已成功刪除"
            />
        </Box>
    );
};

export default JournalPage;
