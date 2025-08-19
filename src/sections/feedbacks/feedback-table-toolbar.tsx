import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';

export type CoffeeShopOption = { id: number; name: string };

type FeedbackTableToolbarProps = {
  filterText: string;
  onFilterText: (event: React.ChangeEvent<HTMLInputElement>) => void;

  filterType: 'all' | 'service' | 'idea';
  onFilterType: (val: 'all' | 'service' | 'idea') => void;

  coffeeShops: CoffeeShopOption[];
  filterCoffeeShopId: number | 'all';
  onFilterCoffeeShop: (val: number | 'all') => void;

  onReload: () => void;
};

export function FeedbackTableToolbar({
  filterText,
  onFilterText,
  filterType,
  onFilterType,
  coffeeShops,
  filterCoffeeShopId,
  onFilterCoffeeShop,
  onReload,
}: FeedbackTableToolbarProps) {
  return (
    <Toolbar
      sx={{
        height: 96,
        display: 'flex',
        justifyContent: 'space-between',
        p: (theme) => theme.spacing(0, 1, 0, 3),
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flex: 1 }}>
        <OutlinedInput
          fullWidth
          value={filterText}
          onChange={onFilterText}
          placeholder="Поиск отзыва, гостя, заведения..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify width={20} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          }
          sx={{ maxWidth: 360 }}
        />

        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel id="fb-type-label">Тип</InputLabel>
          <Select
            labelId="fb-type-label"
            label="Тип"
            size="small"
            value={filterType}
            onChange={(e) => onFilterType(e.target.value as 'all' | 'service' | 'idea')}
          >
            <MenuItem value="all">Все</MenuItem>
            <MenuItem value="service">Обслуживание</MenuItem>
            <MenuItem value="idea">Идея</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel id="fb-shop-label">Заведение</InputLabel>
          <Select
            labelId="fb-shop-label"
            label="Заведение"
            size="small"
            value={filterCoffeeShopId === 'all' ? 'all' : String(filterCoffeeShopId)}
            onChange={(e) => {
              const v = e.target.value as string;
              onFilterCoffeeShop(v === 'all' ? 'all' : Number(v));
            }}
          >
            <MenuItem value="all">Все заведения</MenuItem>
            {coffeeShops.map((s) => (
              <MenuItem key={s.id} value={String(s.id)}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Stack direction="row" spacing={1}>
        <Tooltip title="Обновить">
          <IconButton onClick={onReload}>
            <Iconify icon="solar:restart-bold" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Фильтр списка">
          <IconButton>
            <Iconify icon="ic:round-filter-list" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Toolbar>
  );
}
