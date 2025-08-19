import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type GuestProps = {
  id: number;
  phone: string;
  first_name: string;
  last_name: string;
  birth_date?: string | null;
  points: number;
  coffee_count: number;
  total_spent: number;
  total_spent_rubles: number;
  free_coffee_count: number;
  registration_date: string;
  rank: string;
  cashback_percent: number;
  next_rank?: string;
  progress_to_next_percent?: number;
  lastVisit?: string; // Keeping for backward compatibility if needed
  rank_color?: string;
  rank_icon?: string;
};

type GuestTableRowProps = {
  row: GuestProps;
};



export function GuestTableRow({ row }: GuestTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  // Форматирование даты
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <>
      <TableRow hover tabIndex={-1}>
        <TableCell component="th" scope="row">
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2">{`${row.first_name} ${row.last_name}`.trim()}</Typography>
            {row.birth_date && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                ДР: {formatDate(row.birth_date)}
              </Typography>
            )}
          </Box>
        </TableCell>
        <TableCell>{row.phone}</TableCell>
        <TableCell>
          <Label color="info">{row.points.toLocaleString()} бонусов</Label>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Iconify icon="eva:trending-up-fill" sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="body2">{row.coffee_count || 0}</Typography>
            {row.free_coffee_count ? (
              <Tooltip title="Бесплатных кофе">
                <Typography variant="caption" sx={{ ml: 1, color: 'success.main' }}>
                  +{row.free_coffee_count}
                </Typography>
              </Tooltip>
            ) : null}
          </Box>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{(row.total_spent || 0).toLocaleString()} сом</Typography>
        </TableCell>
        <TableCell>{formatDate(row.lastVisit || '')}</TableCell>
        <TableCell>
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              bgcolor: row.rank_color || 'action.selected',
              color: 'common.white',
              maxWidth: 200,
            }}
          >
            {row.rank_icon ? (
              <Box
                component="img"
                alt={row.rank}
                src={row.rank_icon}
                sx={{ width: 16, height: 16, mr: 1, borderRadius: '50%' }}
              />
            ) : null}
            <Typography variant="caption" sx={{ lineHeight: 1.2, fontWeight: 600 }}>
              {row.rank}
            </Typography>
          </Box>
        </TableCell>
        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem onClick={handleClosePopover}>
            <Iconify icon="solar:pen-bold" />
            Редактировать
          </MenuItem>

          <MenuItem onClick={handleClosePopover} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Удалить
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
} 