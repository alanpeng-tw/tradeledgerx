import { Box, Typography } from '@mui/material';

const Placeholder = ({ title }: { title: string }) => (
    <Box sx={{ p: { xs: 0, sm: 2 } }}>
        <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>{title}</Typography>
        <Typography>此頁面尚在建置中。</Typography>
    </Box>
);

export default Placeholder;
