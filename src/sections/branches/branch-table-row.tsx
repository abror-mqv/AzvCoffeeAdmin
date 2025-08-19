import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import axios from 'axios';
import { API_BASE_URL } from 'src/config-global';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type BranchProps = {
  id: string;
  name: string;
  address: string;
  employeesCount: number;
  contactPerson: string;
  bonuses: number;
  latitude?: number;
  longitude?: number;
  opening_hours?: Record<string, { open: string; close: string }>;
  responsible_senior_barista_phone?: string;
};

type BranchTableRowProps = {
  row: BranchProps;
  onEditSuccess?: () => void;
};

// Дни недели для отображения
const DAYS_OF_WEEK = [
  { id: '0', name: 'Понедельник' },
  { id: '1', name: 'Вторник' },
  { id: '2', name: 'Среда' },
  { id: '3', name: 'Четверг' },
  { id: '4', name: 'Пятница' },
  { id: '5', name: 'Суббота' },
  { id: '6', name: 'Воскресенье' },
];

export function BranchTableRow({ row, onEditSuccess }: BranchTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  // Модалка редактирования
  const [openEdit, setOpenEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editLatitude, setEditLatitude] = useState<string>('');
  const [editLongitude, setEditLongitude] = useState<string>('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);

  // Модалка редактирования рабочих часов
  const [openHours, setOpenHours] = useState(false);
  const [hoursData, setHoursData] = useState<Record<string, { open: string; close: string }>>({});
  const [hoursLoading, setHoursLoading] = useState(false);
  const [hoursError, setHoursError] = useState<string | null>(null);
  const [hoursSuccess, setHoursSuccess] = useState(false);

  const handleOpenEdit = () => {
    setOpenEdit(true);
    setEditName(row.name);
    setEditAddress(row.address);
    setEditLatitude(row.latitude ? String(row.latitude) : '');
    setEditLongitude(row.longitude ? String(row.longitude) : '');
    setEditError(null);
    setEditSuccess(false);
    handleClosePopover();
  };
  const handleCloseEdit = () => {
    setOpenEdit(false);
    setEditError(null);
    setEditSuccess(false);
  };

  // Обработчики для модалки рабочих часов
  const handleOpenHours = () => {
    setOpenHours(true);
    // Инициализируем часы работы из данных заведения или создаем пустой объект
    const initialHours: Record<string, { open: string; close: string }> = {};
    
    // Заполняем данные для всех дней недели
    DAYS_OF_WEEK.forEach((day) => {
      if (row.opening_hours && row.opening_hours[day.id]) {
        initialHours[day.id] = { ...row.opening_hours[day.id] };
      } else {
        initialHours[day.id] = { open: '09:00', close: '18:00' };
      }
    });
    
    setHoursData(initialHours);
    setHoursError(null);
    setHoursSuccess(false);
    handleClosePopover();
  };
  
  const handleCloseHours = () => {
    setOpenHours(false);
    setHoursError(null);
    setHoursSuccess(false);
  };

  const handleUpdateHours = (dayId: string, field: 'open' | 'close', value: string) => {
    setHoursData((prev) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [field]: value,
      },
    }));
  };

  const handleSaveHours = () => {
    setHoursLoading(true);
    setHoursError(null);
    setHoursSuccess(false);
    const token = localStorage.getItem('authToken');
    
    axios.post(`${API_BASE_URL}/api/edit-coffeeshop/`, {
      coffee_shop_id: Number(row.id),
      opening_hours: hoursData,
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    })
      .then(() => {
        setHoursSuccess(true);
        setHoursLoading(false);
        setTimeout(() => {
          setOpenHours(false);
          if (onEditSuccess) onEditSuccess();
        }, 1000);
      })
      .catch(err => {
        setHoursError(err?.response?.data?.detail || err?.response?.data?.error || 'Ошибка сохранения');
        setHoursLoading(false);
      });
  };

  const handleEdit = () => {
    setEditLoading(true);
    setEditError(null);
    setEditSuccess(false);
    const token = localStorage.getItem('authToken');
    
    const data: any = {
      coffee_shop_id: Number(row.id),
      name: editName,
      address: editAddress,
    };
    
    // Добавляем координаты только если они заполнены
    if (editLatitude) {
      data.latitude = parseFloat(editLatitude);
    }
    
    if (editLongitude) {
      data.longitude = parseFloat(editLongitude);
    }
    
    axios.post(`${API_BASE_URL}/api/edit-coffeeshop/`, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    })
      .then(() => {
        setEditSuccess(true);
        setEditLoading(false);
        setTimeout(() => {
          setOpenEdit(false);
          if (onEditSuccess) onEditSuccess();
        }, 1000);
      })
      .catch(err => {
        setEditError(err?.response?.data?.detail || err?.response?.data?.error || 'Ошибка сохранения');
        setEditLoading(false);
      });
  };

  // Форматирование номера телефона для отображения
  const formatPhone = (phone?: string) => {
    if (!phone) return '-';
    return phone;
  };

  return (
    <>
      <TableRow hover tabIndex={-1}>
        <TableCell component="th" scope="row">
          <Box
            sx={{
              gap: 2,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {row.name}
          </Box>
        </TableCell>

        <TableCell>{row.address}</TableCell>

        <TableCell>
          <Label color="info">{row.employeesCount} чел.</Label>
        </TableCell>

        <TableCell>{formatPhone(row.responsible_senior_barista_phone)}</TableCell>

        <TableCell>
          <Label color="success">{row.bonuses?.toLocaleString() || '0'} сом</Label>
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
            width: 160,
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
          <MenuItem onClick={handleOpenEdit}>
            <Iconify icon="solar:pen-bold" />
            Редактировать
          </MenuItem>

          <MenuItem onClick={handleOpenHours}>
            <Iconify icon="solar:restart-bold" />
            Рабочие часы
          </MenuItem>

          <MenuItem onClick={handleClosePopover} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Удалить
          </MenuItem>
        </MenuList>
      </Popover>

      <Dialog open={openEdit} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Редактировать заведение</DialogTitle>
        <DialogContent>
          {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
          {editSuccess && <Alert severity="success" sx={{ mb: 2 }}>Данные успешно сохранены!</Alert>}
          <TextField
            fullWidth
            label="Название"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            disabled={editLoading}
          />
          <TextField
            fullWidth
            label="Адрес"
            value={editAddress}
            onChange={e => setEditAddress(e.target.value)}
            sx={{ mb: 2 }}
            disabled={editLoading}
          />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Широта"
              value={editLatitude}
              onChange={e => setEditLatitude(e.target.value)}
              disabled={editLoading}
              type="number"
              inputProps={{ step: 'any' }}
              placeholder="Например: 55.754167"
            />
            <TextField
              fullWidth
              label="Долгота"
              value={editLongitude}
              onChange={e => setEditLongitude(e.target.value)}
              disabled={editLoading}
              type="number"
              inputProps={{ step: 'any' }}
              placeholder="Например: 37.62"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} disabled={editLoading}>Отмена</Button>
          <Button onClick={handleEdit} variant="contained" color="primary" disabled={editLoading || !editName || !editAddress}>
            {editLoading ? 'Сохраняем...' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модалка редактирования рабочих часов */}
      <Dialog open={openHours} onClose={handleCloseHours} maxWidth="md" fullWidth>
        <DialogTitle>Рабочие часы заведения</DialogTitle>
        <DialogContent>
          {hoursError && <Alert severity="error" sx={{ mb: 2 }}>{hoursError}</Alert>}
          {hoursSuccess && <Alert severity="success" sx={{ mb: 2 }}>Часы работы успешно сохранены!</Alert>}
          
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 2 }}>
            {row.name}
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {DAYS_OF_WEEK.map((day) => (
              <Box key={day.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ width: 120 }}>{day.name}</Typography>
                <TextField
                  label="Открытие"
                  type="time"
                  value={hoursData[day.id]?.open || '09:00'}
                  onChange={(e) => handleUpdateHours(day.id, 'open', e.target.value)}
                  disabled={hoursLoading}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  sx={{ width: 150 }}
                />
                <Typography sx={{ mx: 1 }}>—</Typography>
                <TextField
                  label="Закрытие"
                  type="time"
                  value={hoursData[day.id]?.close || '18:00'}
                  onChange={(e) => handleUpdateHours(day.id, 'close', e.target.value)}
                  disabled={hoursLoading}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  sx={{ width: 150 }}
                />
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHours} disabled={hoursLoading}>Отмена</Button>
          <Button onClick={handleSaveHours} variant="contained" color="primary" disabled={hoursLoading}>
            {hoursLoading ? 'Сохраняем...' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 