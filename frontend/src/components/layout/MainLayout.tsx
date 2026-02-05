import { useState, useEffect } from 'react';
import { Box, Toolbar, useTheme, useMediaQuery } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAccounts } from '../../api/accounts';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';

const MainLayout = () => {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const username = useAuthStore((s) => s.username);
    const setUsername = useAuthStore((s) => s.setUsername);
    const setRole = useAuthStore((s) => s.setRole);
    const logout = useAuthStore((s) => s.logout);
    const navigate = useNavigate();

    useAccounts(); // Load accounts for Header AccountSwitcher on every protected page

    // When token exists but username is empty (e.g. old token), fetch /me to show display name
    useEffect(() => {
        if (!isAuthenticated || username) return;
        authApi.getMe()
            .then((me) => {
                setUsername(me.username);
                setRole(me.role);
            })
            .catch(() => {
                logout();
                navigate('/login', { replace: true });
            });
    }, [isAuthenticated, username, setUsername, setRole, logout, navigate]);

    const handleMenuClick = () => setSidebarOpen(true);
    const handleSidebarClose = () => setSidebarOpen(false);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Header onMenuClick={handleMenuClick} showMenuButton={!isDesktop} />
            <Sidebar
                variant={isDesktop ? 'permanent' : 'temporary'}
                open={isDesktop ? true : sidebarOpen}
                onClose={handleSidebarClose}
            />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    width: { xs: '100%', md: 'calc(100% - 240px)' },
                    minHeight: '100vh',
                    overflow: 'hidden',
                }}
            >
                <Toolbar /> {/* Spacer for AppBar */}
                <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, overflow: 'auto' }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default MainLayout;
