import { Card, CardContent, Typography, Box, Skeleton, useTheme } from '@mui/material';
import { useDailyRisk } from '../../api/risk';
import { RiskStatus } from '../../types/risk';
import RiskProgressBar from './RiskProgressBar';

const DailyLossWidget = () => {
    const { data, isLoading } = useDailyRisk();
    const theme = useTheme();
    const statusText: Record<RiskStatus, string> = {
        [RiskStatus.SAFE]: '安全',
        [RiskStatus.WARNING]: '警示',
        [RiskStatus.DANGER]: '危險',
    };

    if (isLoading) {
        return (
            <Card sx={{ minWidth: 275 }}>
                <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                        日虧損上限
                    </Typography>
                    <Skeleton variant="text" sx={{ fontSize: '2rem' }} />
                    <Skeleton variant="text" sx={{ fontSize: '1rem', width: '60%' }} />
                </CardContent>
            </Card>
        );
    }

    const status = data?.status || RiskStatus.SAFE;
    let statusColor = theme.palette.text.primary;

    if (status === RiskStatus.WARNING) {
        statusColor = theme.palette.warning.main;
    } else if (status === RiskStatus.DANGER) {
        statusColor = theme.palette.error.main;
    }

    const lossAmount = data?.loss_amount ?? 0;

    const formattedLoss = new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'USD',
    }).format(lossAmount * -1);

    return (
        <Card sx={{ minWidth: 275 }}>
            <CardContent>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    當日虧損
                </Typography>
                <Typography variant="h4" component="div" sx={{ color: statusColor, fontWeight: 'bold' }}>
                    {formattedLoss}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    已達上限的 {(data?.loss_percentage ?? 0).toFixed(2)}%
                </Typography>
                <Typography variant="body2">
                    狀態：
                    <Box component="span" sx={{ color: statusColor, fontWeight: 'bold', ml: 1 }}>
                        {statusText[status]}
                    </Box>
                </Typography>

                <RiskProgressBar percentage={data?.loss_percentage ?? 0} status={status} />
            </CardContent>
        </Card>
    );
};

export default DailyLossWidget;
