import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
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
import axios from 'axios';
import { API_BASE_URL } from 'src/config-global';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

// ----------------------------------------------------------------------

export type UserProps = {
  id: string;
  name: string;
  role: string;
  company: string;
  phone: string;
  avatarUrl: string;
  isVerified: boolean;
};

type UserTableRowProps = {
  row: UserProps;
};

export function UserTableRow({ row }: UserTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  // Модалка переназначения
  const [openAssign, setOpenAssign] = useState(false);
  const [shops, setShops] = useState<{ id: number; name: string }[]>([]);
  const [shopsLoading, setShopsLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [isResponsible, setIsResponsible] = useState(true);

  // Модалка редактирования
  const [openEdit, setOpenEdit] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('barista');
  const [editPassword, setEditPassword] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleOpenAssign = () => {
    setOpenAssign(true);
    setAssignError(null);
    setAssignSuccess(false);
    setSelectedShop('');
    setIsResponsible(true);
    setShopsLoading(true);
    // Получаем список заведений
    const token = localStorage.getItem('authToken');
    axios.get(`${API_BASE_URL}/api/coffeeshops/`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then(res => {
        setShops(Array.isArray(res.data) ? res.data.map((item: any) => ({ id: item.id, name: item.name })) : []);
        setShopsLoading(false);
      })
      .catch(() => {
        setShops([]);
        setShopsLoading(false);
      });
    handleClosePopover();
  };
  const handleCloseAssign = () => {
    setOpenAssign(false);
    setAssignError(null);
    setAssignSuccess(false);
  };

  const handleAssign = () => {
    setAssignLoading(true);
    setAssignError(null);
    setAssignSuccess(false);
    const token = localStorage.getItem('authToken');
    axios.post(`${API_BASE_URL}/api/assign-barista/`, {
      barista_id: Number(row.id),
      coffee_shop_id: Number(selectedShop),
      is_responsible: isResponsible,
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    })
      .then(() => {
        setAssignSuccess(true);
        setAssignLoading(false);
        setTimeout(() => {
          setOpenAssign(false);
        }, 1000);
      })
      .catch(err => {
        setAssignError(err?.response?.data?.detail || 'Ошибка переназначения');
        setAssignLoading(false);
      });
  };

  const handleOpenEdit = () => {
    setOpenEdit(true);
    setEditFirstName(row.name.split(' ')[0] || '');
    setEditLastName(row.name.split(' ')[1] || '');
    setEditPhone(row.phone || '');
    setEditRole(row.role === 'старший' ? 'senior_barista' : 'barista');
    setEditPassword('');
    setEditError(null);
    setEditSuccess(false);
    handleClosePopover();
  };
  const handleCloseEdit = () => {
    setOpenEdit(false);
    setEditError(null);
    setEditSuccess(false);
  };

  const handleEdit = () => {
    setEditLoading(true);
    setEditError(null);
    setEditSuccess(false);
    const token = localStorage.getItem('authToken');
    axios.post(`${API_BASE_URL}/api/edit-barista/`, {
      barista_id: Number(row.id),
      phone: editPhone,
      first_name: editFirstName,
      last_name: editLastName,
      role: editRole,
      password: editPassword,
    }, {
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
        }, 1000);
      })
      .catch(err => {
        setEditError(err?.response?.data?.detail || 'Ошибка сохранения');
        setEditLoading(false);
      });
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
            <Avatar alt={row.name} src={row.avatarUrl} />
            {row.name}
          </Box>
        </TableCell>

        <TableCell>{row.company}</TableCell>

        <TableCell>+996 555 123 456</TableCell>

        <TableCell>
          <Label color={row.role === 'старший' ? 'info' : 'default'}>
            {row.role}
          </Label>
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
            width: 180,
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

          <MenuItem onClick={handleClosePopover} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Удалить
          </MenuItem>

          <MenuItem onClick={handleOpenAssign}>
            <Iconify icon="solar:restart-bold" />
            Переназначить
          </MenuItem>
        </MenuList>
      </Popover>

      <Dialog open={openAssign} onClose={handleCloseAssign} maxWidth="xs" fullWidth>
        <DialogTitle>Переназначить бариста</DialogTitle>
        <DialogContent>
          {assignError && <Alert severity="error" sx={{ mb: 2 }}>{assignError}</Alert>}
          {assignSuccess && <Alert severity="success" sx={{ mb: 2 }}>Бариста успешно переназначен!</Alert>}
          <TextField
            select
            fullWidth
            label="Новое заведение"
            value={selectedShop}
            onChange={e => setSelectedShop(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            disabled={assignLoading || shopsLoading}
          >
            {shopsLoading ? (
              <MenuItem value="" disabled>Загрузка...</MenuItem>
            ) : (
              shops.map(shop => (
                <MenuItem key={shop.id} value={shop.id}>{shop.name}</MenuItem>
              ))
            )}
          </TextField>
          <FormControlLabel
            control={<Checkbox checked={isResponsible} onChange={e => setIsResponsible(e.target.checked)} disabled={assignLoading} />}
            label="Ответственный"
            sx={{ mb: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssign} disabled={assignLoading}>Отмена</Button>
          <Button onClick={handleAssign} variant="contained" color="primary" disabled={assignLoading || !selectedShop}>
            {assignLoading ? 'Сохраняем...' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEdit} onClose={handleCloseEdit} maxWidth="xs" fullWidth>
        <DialogTitle>Редактировать бариста</DialogTitle>
        <DialogContent>
          {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
          {editSuccess && <Alert severity="success" sx={{ mb: 2 }}>Данные успешно сохранены!</Alert>}
          <TextField
            fullWidth
            label="Имя"
            value={editFirstName}
            onChange={e => setEditFirstName(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            disabled={editLoading}
          />
          <TextField
            fullWidth
            label="Фамилия"
            value={editLastName}
            onChange={e => setEditLastName(e.target.value)}
            sx={{ mb: 2 }}
            disabled={editLoading}
          />
          <TextField
            fullWidth
            label="Телефон"
            value={editPhone}
            onChange={e => setEditPhone(e.target.value)}
            sx={{ mb: 2 }}
            inputProps={{ inputMode: 'tel' }}
            disabled={editLoading}
          />
          <TextField
            select
            fullWidth
            label="Роль"
            value={editRole}
            onChange={e => setEditRole(e.target.value)}
            sx={{ mb: 2 }}
            disabled={editLoading}
          >
            <MenuItem value="barista">Бариста</MenuItem>
            <MenuItem value="senior_barista">Старший Бариста</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Пароль"
            value={editPassword}
            onChange={e => setEditPassword(e.target.value)}
            sx={{ mb: 2 }}
            type="password"
            disabled={editLoading}
            placeholder="Новый пароль (опционально)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} disabled={editLoading}>Отмена</Button>
          <Button onClick={handleEdit} variant="contained" color="primary" disabled={editLoading || !editFirstName || !editLastName || !editPhone || !editRole}>
            {editLoading ? 'Сохраняем...' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
