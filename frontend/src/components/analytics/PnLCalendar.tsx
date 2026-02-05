import { useState } from 'react';
import { Box, IconButton, Typography, Stack, Paper, Grid, Tooltip, CircularProgress, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isToday,
    addMonths,
    subMonths,
    getDate
} from 'date-fns';
import { usePnLCalendar } from '../../api/analytics';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

const PnLCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const theme = useTheme();

    // Fetch data for the current month
    const { data: pnlData, isLoading } = usePnLCalendar(currentDate);

    // Calendar Logic
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    // Data Map for quick lookup
    // Map key: YYYY-MM-DD
    const pnlMap = new Map();
    pnlData?.forEach(item => {
        pnlMap.set(item.date, item);
    });

    const currencyFormatter = new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    });

    return (
        <Paper sx={{ p: { xs: 2, sm: 3 }, overflow: 'auto' }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <IconButton onClick={handlePrevMonth}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" fontWeight="bold">
                    {format(currentDate, 'yyyy年M月')}
                </Typography>
                <IconButton onClick={handleNextMonth}>
                    <ArrowForwardIcon />
                </IconButton>
            </Stack>

            {/* Weekdays Header */}
            <Grid container columns={7} mb={1}>
                {WEEKDAYS.map(day => (
                    <Grid size={{ xs: 1 }} key={day}>
                        <Typography align="center" variant="subtitle2" color="text.secondary">
                            {day}
                        </Typography>
                    </Grid>
                ))}
            </Grid>

            {/* Days Grid */}
            {isLoading ? (
                <Box display="flex" justifyContent="center" p={5}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container columns={7} spacing={1}>
                    {calendarDays.map((day) => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const data = pnlMap.get(dateKey);
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const dayPnL = data?.pnl ?? 0;
                        const hasTrades = (data?.trade_count ?? 0) > 0;

                        // Determine Color
                        let bgcolor = theme.palette.action.hover; // default gray
                        let textColor = theme.palette.text.primary;

                        if (hasTrades) {
                            if (dayPnL > 0) {
                                bgcolor = theme.palette.mode === 'light' ? '#e8f5e9' : '#1b5e20'; // Green 100 or 900
                                textColor = theme.palette.mode === 'light' ? '#1b5e20' : '#e8f5e9';
                            } else if (dayPnL < 0) {
                                bgcolor = theme.palette.mode === 'light' ? '#ffebee' : '#b71c1c'; // Red 100 or 900
                                textColor = theme.palette.mode === 'light' ? '#b71c1c' : '#ffebee';
                            } else {
                                bgcolor = theme.palette.mode === 'light' ? '#fafafa' : '#424242'; // Neutral
                            }
                        } else if (!isCurrentMonth) {
                            bgcolor = 'transparent';
                            textColor = theme.palette.text.disabled;
                        }

                        // Border for Today
                        const border = isToday(day) ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent';

                        return (
                            <Grid size={{ xs: 1 }} key={dateKey}>
                        <Tooltip title={hasTrades ? `${data.trade_count} 筆交易，${currencyFormatter.format(dayPnL)}` : '當日無交易'}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            height: 80,
                                            p: 1,
                                            bgcolor,
                                            border,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            opacity: isCurrentMonth ? 1 : 0.5,
                                            cursor: hasTrades ? 'pointer' : 'default',
                                            transition: 'all 0.2s',
                                            '&:hover': hasTrades ? { transform: 'scale(1.02)', boxShadow: 1 } : {}
                                        }}
                                        onClick={() => {
                                            if (hasTrades) {
                                                // Navigate to journal (TODO)
                                                // navigate(`/journal?date=${dateKey}`);
                                            }
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ color: textColor, fontWeight: 'bold' }}>
                                            {getDate(day)}
                                        </Typography>

                                        {hasTrades && (
                                            <Typography
                                                variant="body2"
                                                align="center"
                                                sx={{
                                                    color: textColor,
                                                    fontWeight: 'bold',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                {currencyFormatter.format(dayPnL)}
                                            </Typography>
                                        )}
                                    </Paper>
                                </Tooltip>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Paper>
    );
};

export default PnLCalendar;
