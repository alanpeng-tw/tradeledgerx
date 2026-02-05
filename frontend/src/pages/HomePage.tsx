import { Box, Typography, Button, Paper, Stack, CircularProgress, Alert } from '@mui/material';
import { useAuthStore } from '../store/authStore';
import { useAccountStore } from '../store/accountStore';
import { useAccounts } from '../api/accounts';
import DailyLossWidget from '../components/dashboard/DailyLossWidget';

const HomePage = () => {
    const logout = useAuthStore((state) => state.logout);
    const { accounts, activeAccountId, setActiveAccount } = useAccountStore();
    const { isLoading, error, refetch } = useAccounts();

    const activeAccount = accounts.find(a => a.id === activeAccountId);

    return (
        <Box sx={{ p: { xs: 0, sm: 2 }, maxWidth: '100%', overflow: 'auto' }}>
            <Typography variant="h4" component="h1" gutterBottom color="primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                儀表板
            </Typography>
            <Typography paragraph sx={{ mb: 2 }}>
                歡迎使用 TradeLedgerX，您已成功登入。
            </Typography>

            <Box sx={{ maxWidth: 400, mb: 3 }}>
                <DailyLossWidget />
            </Box>

            <Paper sx={{ p: { xs: 2, sm: 3 }, my: 3, bgcolor: 'background.paper' }}>
                <Typography variant="h6" gutterBottom>帳戶狀態除錯資訊</Typography>

                {isLoading && <CircularProgress size={24} sx={{ mb: 2 }} />}
                {error && <Alert severity="error" sx={{ mb: 2 }}>無法載入帳戶：{(error as Error).message}</Alert>}

                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Button variant="contained" onClick={() => refetch()}>
                        重新整理帳戶
                    </Button>
                </Stack>

                <Typography variant="subtitle1" gutterBottom>使用中帳戶：{activeAccount?.name || '無'} ({activeAccountId || '-'})</Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
                    {accounts.map(acc => (
                        <Button
                            key={acc.id}
                            variant={activeAccountId === acc.id ? "contained" : "outlined"}
                            onClick={() => setActiveAccount(acc.id)}
                            size="small"
                        >
                            切換 {acc.name}
                        </Button>
                    ))}
                </Stack>
            </Paper>

            <Button variant="outlined" color="secondary" onClick={logout}>
                登出
            </Button>
        </Box>
    );
};

export default HomePage;
