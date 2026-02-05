import { Box, LinearProgress, keyframes } from '@mui/material';
import { RiskStatus } from '../../types/risk';

// Keyframes for pulse animation
const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`;

interface RiskProgressBarProps {
    percentage: number;
    status: RiskStatus;
}

const RiskProgressBar = ({ percentage, status }: RiskProgressBarProps) => {
    const isDanger = status === RiskStatus.DANGER;
    const visualPercentage = Math.min(percentage, 100);

    // Color logic
    let colorKey: 'success' | 'warning' | 'error' = 'success';
    if (percentage >= 80 || status === RiskStatus.DANGER) {
        colorKey = 'error';
    } else if (percentage >= 60) {
        colorKey = 'warning';
    }

    return (
        <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress
                variant="determinate"
                value={visualPercentage}
                color={colorKey}
                sx={{
                    height: 10,
                    borderRadius: 5,
                    [`& .MuiLinearProgress-bar`]: {
                        borderRadius: 5,
                        animation: isDanger ? `${pulse} 1.5s infinite ease-in-out` : 'none',
                    }
                }}
            />
        </Box>
    );
};

export default RiskProgressBar;
