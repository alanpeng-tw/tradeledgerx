import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100vh',
                        bgcolor: 'background.default',
                        p: 3,
                    }}
                >
                    <Alert severity="error" sx={{ mb: 2, width: '100%', maxWidth: 500 }}>
                        <Typography variant="h6">發生錯誤</Typography>
                        <Typography variant="body2">
                            {this.state.error?.message || '系統遇到未預期的錯誤。'}
                        </Typography>
                    </Alert>
                    <Button variant="contained" onClick={this.handleReload}>
                        重新載入頁面
                    </Button>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
