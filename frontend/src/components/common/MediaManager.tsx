import { useState } from 'react';
import { Box, TextField, Button, ImageList, ImageListItem, IconButton, ImageListItemBar, Typography, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddLinkIcon from '@mui/icons-material/AddLink';

interface MediaManagerProps {
    value: string[];
    onChange: (urls: string[]) => void;
    readOnly?: boolean;
}

const MediaManager = ({ value, onChange, readOnly = false }: MediaManagerProps) => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');

    const handleAdd = () => {
        const url = inputValue.trim();
        if (!url) return;

        // Basic URL validation
        try {
            new URL(url);
        } catch {
            setError('Invalid URL');
            return;
        }

        if (value.includes(url)) {
            setError('URL already added');
            return;
        }

        onChange([...value, url]);
        setInputValue('');
        setError('');
    };

    const handleDelete = (urlToDelete: string) => {
        onChange(value.filter(url => url !== urlToDelete));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle2" gutterBottom>
                Attachments (Charts/Screenshots)
            </Typography>

            {!readOnly && (
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <TextField
                        size="small"
                        fullWidth
                        placeholder="Paste image URL (e.g. TradingView link)"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setError('');
                        }}
                        onKeyDown={handleKeyDown}
                        error={!!error}
                        helperText={error}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<AddLinkIcon />}
                        onClick={handleAdd}
                        disabled={!inputValue}
                    >
                        Add
                    </Button>
                </Stack>
            )}

            {value.length > 0 ? (
                <ImageList cols={3} rowHeight={160} sx={{ mt: 1 }}>
                    {value.map((url, index) => (
                        <ImageListItem key={`${url}-${index}`}>
                            <img
                                src={url}
                                alt={`Attachment ${index + 1}`}
                                loading="lazy"
                                style={{ height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                    // Fallback for broken images if possible, or just let standard alt show
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/300x200?text=Broken+Link';
                                }}
                            />
                            {!readOnly && (
                                <ImageListItemBar
                                    sx={{
                                        background:
                                            'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, ' +
                                            'rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                                    }}
                                    position="top"
                                    actionIcon={
                                        <IconButton
                                            sx={{ color: 'white' }}
                                            onClick={() => handleDelete(url)}
                                            aria-label={`delete attachment ${index + 1}`}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                    actionPosition="right"
                                />
                            )}
                        </ImageListItem>
                    ))}
                </ImageList>
            ) : (
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No attachments
                </Typography>
            )}
        </Box>
    );
};

export default MediaManager;
