import { Box, Typography, Container, Grid, CircularProgress, Alert } from '@mui/material';
import PnLCalendar from '../components/analytics/PnLCalendar';
import WinRateChart from '../components/analytics/WinRateChart';
import EquityCurveChart from '../components/analytics/EquityCurveChart';
import { useAnalyticsStats } from '../api/analytics';

const AnalyticsPage = () => {
    // Fetch aggregated stats - default period 'all' used for now
    const { data: stats, isLoading, error } = useAnalyticsStats('all');

    return (
        <Container maxWidth="xl" disableGutters sx={{ px: { xs: 0, sm: 2 }, mt: { xs: 2, sm: 4 }, mb: 4 }}>
            <Box sx={{ mb: { xs: 2, sm: 4 } }}>
                <Typography variant="h4" component="h1" gutterBottom color="primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    數據分析
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    檢視每月績效的一致性以及統計優勢。
                </Typography>
            </Box>

            {/* Performance Overview Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {isLoading ? (
                    <Grid size={{ xs: 12 }}>
                        <Box display="flex" justifyContent="center" p={3}>
                            <CircularProgress />
                        </Box>
                    </Grid>
                ) : error ? (
                    <Grid size={{ xs: 12 }}>
                        <Alert severity="warning">
                            無法載入績效統計。這可能是因為帳戶尚無資料或 API 尚未準備完成。
                        </Alert>
                    </Grid>
                ) : (
                    <>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <WinRateChart stats={stats} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <EquityCurveChart stats={stats} />
                        </Grid>
                    </>
                )}
            </Grid>

            {/* Monthly Calendar */}
            <PnLCalendar />
        </Container>
    );
};

export default AnalyticsPage;
