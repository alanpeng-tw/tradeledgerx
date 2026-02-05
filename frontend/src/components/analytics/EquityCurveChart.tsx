import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import type { AnalyticsStats } from '../../types/analytics';

const EquityCurveChart = ({ stats }: { stats?: AnalyticsStats }) => {
    const theme = useTheme();

    if (!stats) return null;

    const currencyFormatter = new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'USD',
    });

    return (
        <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
                資金曲線
            </Typography>

            <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                        data={stats.equity_curve}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(val) => {
                                const d = new Date(val);
                                return `${d.getMonth() + 1}/${d.getDate()}`;
                            }}
                        />
                        <YAxis width={60} tick={{ fontSize: 12 }} />
                        <Tooltip
                            formatter={(value: number | undefined) => [currencyFormatter.format(value ?? 0), '餘額']}
                            labelFormatter={(label) => new Date(label).toLocaleDateString('zh-TW')}
                            contentStyle={{
                                backgroundColor: theme.palette.background.paper,
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 4
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="equity"
                            stroke={theme.palette.primary.main}
                            fill={theme.palette.primary.light}
                            fillOpacity={0.2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default EquityCurveChart;
