import { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Button, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PersonIcon from '@mui/icons-material/Person';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuthStore } from '../../store/authStore';
import AccountSwitcher from '../common/AccountSwitcher';
import { useLocation, useNavigate } from 'react-router-dom';

interface HeaderProps {
    onMenuClick?: () => void;
    showMenuButton?: boolean;
}

const Header = ({ onMenuClick, showMenuButton = false }: HeaderProps) => {
    const logout = useAuthStore((state) => state.logout);
    const username = useAuthStore((state) => state.username);
    const displayName = username;
    const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const isSettingsPage = location.pathname.startsWith('/settings');

    const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setUserMenuAnchor(event.currentTarget);
    };
    const handleUserMenuClose = () => setUserMenuAnchor(null);
    const handleLogout = () => {
        handleUserMenuClose();
        logout();
    };

    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar sx={{ gap: { xs: 0.5, sm: 1 } }}>
                {showMenuButton && (
                    <IconButton
                        color="inherit"
                        aria-label="開啟選單"
                        onClick={onMenuClick}
                        sx={{ mr: 1, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                )}
                <Typography
                    variant="h6"
                    noWrap
                    component="div"
                    sx={{ flexGrow: 1, fontSize: { xs: '1rem', sm: '1.25rem' }, cursor: 'pointer' }}
                    onClick={() => navigate('/dashboard')}
                    aria-label="回到首頁"
                >
                    TradeLedgerX
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, gap: 1 }}>
                    {displayName ? (
                        <>
                            <Button
                                color="inherit"
                                size="small"
                                onClick={handleUserMenuOpen}
                                endIcon={<ExpandMoreIcon />}
                                sx={{ textTransform: 'none', maxWidth: { xs: 100, sm: 180 }, minWidth: 0 }}
                                aria-label="使用者選單"
                                aria-controls={userMenuAnchor ? 'user-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={userMenuAnchor ? 'true' : undefined}
                            >
                                <PersonIcon sx={{ mr: 0.5, fontSize: '1.1rem' }} />
                                <Typography variant="body2" noWrap component="span" sx={{ opacity: 0.95 }}>
                                    {displayName}
                                </Typography>
                            </Button>
                            <Menu
                                id="user-menu"
                                anchorEl={userMenuAnchor}
                                open={Boolean(userMenuAnchor)}
                                onClose={handleUserMenuClose}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                sx={{ zIndex: 1400 }}
                            >
                                <MenuItem onClick={handleLogout}>
                                    <ExitToAppIcon fontSize="small" sx={{ mr: 1 }} />
                                    登出
                                </MenuItem>
                            </Menu>
                        </>
                    ) : null}
                    {!isSettingsPage ? <AccountSwitcher /> : null}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
