import { DataGrid, type GridColDef, type GridPaginationModel, type GridSortModel } from '@mui/x-data-grid';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { type Trade } from '../../types/trade';

interface TradeDatagridProps {
    rows: Trade[];
    loading: boolean;
    rowCount: number;
    paginationModel: GridPaginationModel;
    onPaginationModelChange: (model: GridPaginationModel) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
    onSortModelChange?: (model: GridSortModel) => void;
}

const TradeDatagrid = ({
    rows,
    loading,
    rowCount,
    paginationModel,
    onPaginationModelChange,
    onDelete,
    onEdit,
    onSortModelChange
}: TradeDatagridProps) => {

    const columns: GridColDef<Trade>[] = [
        {
            field: 'entry_date',
            headerName: '日期',
            width: 150,
            valueFormatter: (value) => value ? new Date(value).toLocaleDateString() : ''
        },
        { field: 'symbol', headerName: '商品', width: 100 },
        {
            field: 'type',
            headerName: '方向',
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={params.value === 'LONG' ? 'success' : 'error'}
                    size="small"
                    variant="outlined"
                />
            )
        },
        {
            field: 'entry_price',
            headerName: '進場價',
            type: 'number',
            width: 110
        },
        {
            field: 'exit_price',
            headerName: '出場價',
            type: 'number',
            width: 110
        },
        {
            field: 'pnl',
            headerName: '損益',
            type: 'number',
            width: 120,
            renderCell: (params) => {
                if (params.value == null) return '-';
                return (
                    <Box sx={{ color: params.value >= 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}>
                        {new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'USD' }).format(params.value)}
                    </Box>
                );
            }
        },
        {
            field: 'tags',
            headerName: '標籤',
            width: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 0.5, overflow: 'hidden' }}>
                    {params.value?.map((tag: string) => (
                        <Chip key={tag} label={tag} size="small" />
                    ))}
                </Box>
            )
        },
        {
            field: 'actions',
            headerName: '操作',
            width: 120,
            sortable: false,
            renderCell: (params) => (
                <Box>
                    <Tooltip title="編輯">
                        <IconButton size="small" onClick={() => onEdit(params.row.id)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="刪除">
                        <IconButton size="small" color="error" onClick={() => onDelete(params.row.id)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    return (
        <Box sx={{ height: { xs: 400, sm: 600 }, width: '100%', minWidth: 0, overflow: 'auto' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                rowCount={rowCount}
                loading={loading}
                pageSizeOptions={[10, 25, 50]}
                paginationModel={paginationModel}
                paginationMode="server"
                onPaginationModelChange={onPaginationModelChange}
                sortingMode="server"
                onSortModelChange={onSortModelChange}
                disableRowSelectionOnClick
            />
        </Box>
    );
};

export default TradeDatagrid;
