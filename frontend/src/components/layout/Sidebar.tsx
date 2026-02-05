import { useState, useEffect } from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Box,
    IconButton,
    Collapse,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import BookIcon from '@mui/icons-material/Book';
import BarChartIcon from '@mui/icons-material/BarChart';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import SettingsIcon from '@mui/icons-material/Settings';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import { useLocation, useNavigate } from 'react-router-dom';

const drawerWidth = 240;

interface SidebarProps {
    variant: 'permanent' | 'temporary';
    open: boolean;
    onClose: () => void;
}

const menuItems = [
    { text: '儀表板', icon: <HomeIcon />, path: '/dashboard' },
    { text: '交易日誌', icon: <BookIcon />, path: '/journal' },
    { text: '數據分析', icon: <BarChartIcon />, path: '/analytics' },
];

const settingsSubItems = [
    { text: '帳戶管理', icon: <ManageAccountsIcon />, path: '/accounts' },
    { text: '交易策略管理', icon: <PsychologyIcon />, path: '/settings/strategies' },
    { text: '券商管理', icon: <BusinessCenterIcon />, path: '/settings/brokers' },
];

const Sidebar = ({ variant, open, onClose }: SidebarProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isSettingsPath = location.pathname.startsWith('/settings');
    const [settingsOpen, setSettingsOpen] = useState(isSettingsPath);

    useEffect(() => {
        if (isSettingsPath) setSettingsOpen(true);
    }, [isSettingsPath]);

    const handleNav = (path: string) => {
        navigate(path);
        if (variant === 'temporary') onClose();
    };

    const handleSettingsToggle = () => {
        setSettingsOpen((prev) => !prev);
    };

    const drawerContent = (
        <>
            {variant === 'temporary' && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', p: 1 }}>
                    <IconButton onClick={onClose} aria-label="關閉選單">
                        <ChevronLeftIcon />
                    </IconButton>
                </Box>
            )}
            {variant === 'permanent' && <Toolbar />}
            <Box sx={{ overflow: 'auto' }}>
                <List>
                    {menuItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                onClick={() => handleNav(item.path)}
                                selected={location.pathname === item.path}
                            >
                                <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={handleSettingsToggle}
                            selected={location.pathname === '/settings'}
                        >
                            <ListItemIcon sx={{ color: isSettingsPath ? 'primary.main' : 'inherit' }}>
                                <SettingsIcon />
                            </ListItemIcon>
                            <ListItemText primary="設定" />
                            {settingsOpen ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                    </ListItem>
                    <Collapse in={settingsOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {settingsSubItems.map((item) => (
                                <ListItem key={item.text} disablePadding>
                                    <ListItemButton
                                        sx={{ pl: 3 }}
                                        onClick={() => handleNav(item.path)}
                                        selected={location.pathname === item.path}
                                    >
                                        <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit', minWidth: 36 }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText primary={item.text} />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Collapse>
                </List>
            </Box>
        </>
    );

    if (variant === 'permanent') {
        return (
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    display: { xs: 'none', md: 'block' },
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        mt: '64px', // below AppBar
                    },
                }}
            >
                {drawerContent}
            </Drawer>
        );
    }

    return (
        <Drawer
            variant="temporary"
            open={open}
            onClose={onClose}
            ModalProps={{ keepMounted: true }} // better open performance on mobile
            sx={{
                display: { xs: 'block', md: 'none' },
                [`& .MuiDrawer-paper`]: {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    mt: '64px',
                },
            }}
        >
            {drawerContent}
        </Drawer>
    );
};

export default Sidebar;
