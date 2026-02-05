import { useState } from 'react';
import { MenuItem, Menu, Button, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import { useAccountStore } from '../../store/accountStore';
import { useQueryClient } from '@tanstack/react-query';

const AccountSwitcher = () => {
    const { accounts, activeAccountId, setActiveAccount } = useAccountStore();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => setAnchorEl(null);

    const handleSelectAccount = (accountId: string) => {
        setActiveAccount(accountId);
        // Invalidate + refetch account-scoped data so UI updates immediately
        queryClient.invalidateQueries({ queryKey: ['trades'] });
        queryClient.invalidateQueries({ queryKey: ['risk'] });
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
        queryClient.invalidateQueries({ queryKey: ['strategies'] });
        queryClient.refetchQueries({ queryKey: ['trades'] });
        queryClient.refetchQueries({ queryKey: ['risk'] });
        queryClient.refetchQueries({ queryKey: ['analytics'] });
        queryClient.refetchQueries({ queryKey: ['strategies'] });
        handleClose();
    };

    if (accounts.length === 0) {
        return (
            <Button
                size="small"
                color="inherit"
                variant="outlined"
                sx={{ minWidth: { xs: 80, sm: 120 }, borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'rgba(255,255,255,0.8)' } }}
                onClick={() => navigate('/accounts')}
                aria-label="No accounts, go to account management"
            >
                No Accounts
            </Button>
        );
    }

    const activeAccount = accounts.find((a) => a.id === activeAccountId);
    const displayLabel = activeAccount ? `${activeAccount.name} (${activeAccount.broker})` : '選擇帳戶';

    return (
        <>
            <Button
                size="small"
                color="inherit"
                variant="outlined"
                onClick={handleOpen}
                endIcon={<ExpandMoreIcon />}
                sx={{
                    minWidth: { xs: 100, sm: 160, md: 200 },
                    maxWidth: { xs: 140, sm: 220 },
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': { borderColor: 'rgba(255,255,255,0.8)' },
                    textTransform: 'none',
                }}
                aria-label="選擇帳戶"
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
            >
                <Typography variant="body2" noWrap component="span">
                    {displayLabel}
                </Typography>
            </Button>
            <Menu
                id="account-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{ zIndex: 1400 }}
            >
                {accounts.map((account) => (
                    <MenuItem
                        key={account.id}
                        selected={account.id === activeAccountId}
                        onClick={() => handleSelectAccount(account.id)}
                    >
                        {account.name} ({account.broker})
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default AccountSwitcher;
