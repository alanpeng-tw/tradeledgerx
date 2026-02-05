import { Autocomplete, TextField, Chip, Box, CircularProgress } from '@mui/material';
import { type Tag, type TagType } from '../../types/tag';
import { useTags } from '../../api/tags';

interface TagMultiSelectProps {
    type?: TagType;
    value: string[]; // List of Tag IDs
    onChange: (ids: string[]) => void;
    label?: string;
    placeholder?: string;
}

const TagMultiSelect = ({ type, value, onChange, label = 'Tags', placeholder = 'Select tags' }: TagMultiSelectProps) => {
    const { data: tags = [], isLoading } = useTags();

    // Filter tags by type if provided
    const availableTags = type ? tags.filter(t => t.type === type) : tags;

    // Map IDs back to Tag objects for the Value prop
    // We need to handle potential missing tags if ID exists but tag not loaded, though rare with full fetch
    const selectedTags = value.map(id => availableTags.find(t => t.id === id)).filter((t): t is Tag => !!t);

    return (
        <Autocomplete
            multiple
            id={`tag-select-${type || 'all'}`}
            options={availableTags}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, val) => option.id === val.id}
            value={selectedTags}
            onChange={(_, newValue) => {
                onChange(newValue.map(t => t.id));
            }}
            loading={isLoading}
            renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                        <Chip
                            key={key}
                            label={option.name}
                            size="small"
                            sx={{
                                bgcolor: option.color ? `${option.color}20` : undefined, // 20 = ~12% opacity
                                borderColor: option.color,
                                borderWidth: 1,
                                borderStyle: 'solid',
                                '& .MuiChip-label': { color: option.color }
                            }}
                            {...tagProps}
                        />
                    );
                })
            }
            renderOption={(props, option) => {
                // Extract key from props to avoid React warning and spread rest
                const { key, ...optionProps } = props;
                return (
                    <li key={key} {...optionProps}>
                        <Box
                            component="span"
                            sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                bgcolor: option.color,
                                mr: 1.5,
                            }}
                        />
                        {option.name}
                    </li>
                );
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    placeholder={placeholder}
                    slotProps={{
                        input: {
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }
                    }}
                />
            )}
        />
    );
};

export default TagMultiSelect;
