import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                minHeight: '400px',
                p: { xs: 2, sm: 3 },
                textAlign: 'center',
            }}
        >
            <Typography variant="h2" color="text.secondary" gutterBottom>
                404
            </Typography>
            <Typography variant="h5" gutterBottom>
                找不到頁面
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                您要前往的頁面不存在或已被移除。
            </Typography>
            <Button variant="outlined" onClick={() => navigate('/')}>
                回到儀表板
            </Button>
        </Box>
    );
};

export default NotFoundPage;
