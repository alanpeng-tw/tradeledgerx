import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import type { AnalyticsStats } from '../../types/analytics';

const WinRateChart = ({ stats }: { stats?: AnalyticsStats }) => {
    const theme = useTheme();

    if (!stats) return null;

    const wins = stats.wins ?? 0;
    const losses = stats.losses ?? 0;
    const breakeven = stats.breakeven ?? 0;
    const totalTrades = stats.total_trades ?? 0;

    const data = [
        { name: '獲利', value: wins, color: theme.palette.mode === 'light' ? '#4caf50' : '#81c784' },    // Green
        { name: '虧損', value: losses, color: theme.palette.mode === 'light' ? '#f44336' : '#e57373' }, // Red
        { name: '打平', value: breakeven, color: theme.palette.action.disabled },                      // Grey
    ].filter(item => item.value > 0);

    const winRate = totalTrades > 0
        ? ((wins / totalTrades) * 100).toFixed(1)
        : '0.0';

    return (
        <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" gutterBottom>
                勝率
            </Typography>

            <Box sx={{ position: 'relative', width: '100%', maxWidth: 220, minWidth: 180, height: 220, mx: 'auto' }}>
                <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Text */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="h5" fontWeight="bold">
                        {winRate}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        共 {totalTrades} 筆交易
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                    勝：{wins}
                </Typography>
                <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                    敗：{losses}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    打平：{breakeven}
                </Typography>
            </Box>
        </Paper>
    );
};

export default WinRateChart;
