import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress
} from '@mui/material';
import { authApi, type LoginCredentials } from '../api/auth';
import { useAuthStore } from '../store/authStore';

const LoginPage: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>();
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const setSession = useAuthStore((state) => state.setSession);
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect to the page they tried to visit, or home
    const from = location.state?.from?.pathname || "/";

    const onSubmit = async (data: LoginCredentials) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authApi.login(data);
            setSession(response.username, response.role);
            navigate(from, { replace: true });
        } catch (err: any) {
            console.error('Login failed', err);
            const detail = err.response?.data?.detail;
            if (typeof detail === 'string') {
                setError(detail === 'Invalid username or password' ? '帳號或密碼錯誤' : detail);
            } else if (err.response?.status === 401) {
                setError('帳號或密碼錯誤');
            } else if (err.code === 'ERR_NETWORK' || !err.response) {
                setError('無法連線後端，請確認後端已啟動（本機預設 port 8000，Docker 為 8081）');
            } else {
                setError('帳號或伺服器錯誤');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                p: 2,
            }}
        >
            <Card sx={{ maxWidth: 400, width: '100%', mx: { xs: 0, sm: 2 } }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 4 }}>
                    <Typography variant="h5" component="h1" align="center" gutterBottom>
                        TradeLedgerX 登入
                    </Typography>

                    {error && <Alert severity="error">{error}</Alert>}

                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <TextField
                            label="使用者名稱"
                            variant="outlined"
                            fullWidth
                            autoComplete="username"
                            error={!!errors.username}
                            helperText={errors.username ? '請輸入使用者名稱' : ''}
                            {...register('username', { required: true })}
                        />

                        <TextField
                            label="密碼"
                            type="password"
                            variant="outlined"
                            fullWidth
                            autoComplete="current-password"
                            error={!!errors.password}
                            helperText={errors.password ? '請輸入密碼' : ''}
                            {...register('password', { required: true })}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                            disabled={isLoading}
                        >
                            {isLoading ? <CircularProgress size={24} /> : '登入'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default LoginPage;
