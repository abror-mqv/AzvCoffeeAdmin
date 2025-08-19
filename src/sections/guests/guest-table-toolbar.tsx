import { useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type GuestTableToolbarProps = {
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  minSpent: string;
  onMinSpentChange: (value: string) => void;
  minCoffee: string;
  onMinCoffeeChange: (value: string) => void;
  onApplyFilters: () => void;
};

export function GuestTableToolbar({ 
  filterName, 
  onFilterName,
  minSpent,
  onMinSpentChange,
  minCoffee,
  onMinCoffeeChange,
  onApplyFilters
}: GuestTableToolbarProps) {
  const [openFilters, setOpenFilters] = useState(false);
  
  const handleOpenFilters = () => {
    setOpenFilters(true);
  };
  
  const handleCloseFilters = () => {
    setOpenFilters(false);
  };
  
  const handleApplyFilters = () => {
    onApplyFilters();
    handleCloseFilters();
  };

  return (
    <>
      <Toolbar
        sx={{
          height: 96,
          display: 'flex',
          justifyContent: 'space-between',
          p: (theme) => theme.spacing(0, 1, 0, 3),
        }}
      >
        <OutlinedInput
          fullWidth
          value={filterName}
          onChange={onFilterName}
          placeholder="Поиск гостя..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify width={20} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          }
          sx={{ maxWidth: 320 }}
        />

        <Tooltip title="Фильтр списка">
          <IconButton onClick={handleOpenFilters}>
            <Iconify icon="ic:round-filter-list" />
          </IconButton>
        </Tooltip>
      </Toolbar>
      
      <Dialog open={openFilters} onClose={handleCloseFilters} maxWidth="xs" fullWidth>
        <DialogTitle>Фильтры</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Минимальная сумма трат (сом)
            </Typography>
            <TextField
              fullWidth
              type="number"
              value={minSpent}
              onChange={(e) => onMinSpentChange(e.target.value)}
              placeholder="Например: 1000"
              InputProps={{
                startAdornment: <InputAdornment position="start">С</InputAdornment>,
              }}
              sx={{ mb: 3 }}
            />
            
            <Typography variant="subtitle2" gutterBottom>
              Минимальное количество кофе
            </Typography>
            <TextField
              fullWidth
              type="number"
              value={minCoffee}
              onChange={(e) => onMinCoffeeChange(e.target.value)}
              placeholder="Например: 5"
              InputProps={{
                startAdornment: <InputAdornment position="start">☕</InputAdornment>,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFilters}>Отмена</Button>
          <Button onClick={handleApplyFilters} variant="contained">
            Применить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 