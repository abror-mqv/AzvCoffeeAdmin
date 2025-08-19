import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import axios from 'axios';
import { API_BASE_URL } from 'src/config-global';

import { _users } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from '../table-no-data';
import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { UserProps } from '../user-table-row';

// ----------------------------------------------------------------------

export function EmployeesView() {
  const table = useTable();

  const [filterName, setFilterName] = useState('');

  // Данные сотрудников с бэка
  const [users, setUsers] = useState<UserProps[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Модалка создания сотрудника
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('barista');
  const [coffeeShop, setCoffeeShop] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [shops, setShops] = useState<{ id: number; name: string }[]>([]);
  const [shopsLoading, setShopsLoading] = useState(true);

  const handleOpen = () => {
    setOpen(true);
    setFirstName('');
    setLastName('');
    setPhone('');
    setPassword('');
    setRole('barista');
    setCoffeeShop('');
    setError(null);
    setSuccess(false);
  };
  const handleClose = () => {
    setOpen(false);
    setError(null);
    setSuccess(false);
  };

  // Получение заведений для dropdown
  useEffect(() => {
    if (!open) return;
    setShopsLoading(true);
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
  }, [open]);

  useEffect(() => {
    setFetchLoading(true);
    setFetchError(null);
    const token = localStorage.getItem('authToken');
    axios.get(`${API_BASE_URL}/api/baristas/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then(res => {
        setUsers(
          Array.isArray(res.data)
            ? res.data.map((item: any) => ({
                id: String(item.id),
                name: `${item.first_name} ${item.last_name}`,
                company: item.coffee_shop_name,
                phone: item.phone,
                role: item.role === 'senior_barista' ? 'старший' : 'бариста',
                avatarUrl: '', // Можно добавить генерацию аватарки
                isVerified: true, // Можно доработать по необходимости
              }))
            : []
        );
        setFetchLoading(false);
      })
      .catch(err => {
        setFetchError('Ошибка загрузки сотрудников');
        setFetchLoading(false);
      });
  }, []);

  const handleCreate = () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    const token = localStorage.getItem('authToken');
    axios.post(`${API_BASE_URL}/api/manager/register-barista/`, {
      phone,
      role,
      coffee_shop_id: Number(coffeeShop),
      password,
      first_name: firstName,
      last_name: lastName,
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    })
      .then(() => {
        setSuccess(true);
        setLoading(false);
        setTimeout(() => {
          setOpen(false);
        }, 1000);
      })
      .catch(err => {
        setError(err?.response?.data?.detail || 'Ошибка создания сотрудника');
        setLoading(false);
      });
  };

  const dataFiltered: UserProps[] = applyFilter({
    inputData: users,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <DashboardContent>
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Персонал
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpen}
        >
          Новый сотрудник
        </Button>
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Новый сотрудник</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>Сотрудник успешно создан!</Alert>}
          <TextField
            fullWidth
            label="Имя"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Фамилия"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            sx={{ mb: 2 }}
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Телефон"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            sx={{ mb: 2 }}
            inputProps={{ inputMode: 'tel' }}
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            sx={{ mb: 2 }}
            type="password"
            disabled={loading}
          />
          <TextField
            select
            fullWidth
            label="Роль"
            value={role}
            onChange={e => setRole(e.target.value)}
            sx={{ mb: 2 }}
            disabled={loading}
          >
            <MenuItem value="barista">Бариста</MenuItem>
            <MenuItem value="senior_barista">Старший Бариста</MenuItem>
          </TextField>
          <TextField
            select
            fullWidth
            label="Заведение"
            value={coffeeShop}
            onChange={e => setCoffeeShop(e.target.value)}
            sx={{ mb: 2 }}
            disabled={loading || shopsLoading}
          >
            {shopsLoading ? (
              <MenuItem value="" disabled>Загрузка...</MenuItem>
            ) : (
              shops.map(shop => (
                <MenuItem key={shop.id} value={shop.id}>{shop.name}</MenuItem>
              ))
            )}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>Отмена</Button>
          <Button onClick={handleCreate} variant="contained" color="primary" disabled={loading || !firstName || !lastName || !phone || !password || !role || !coffeeShop}>
            {loading ? 'Создание...' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      <Card>
        {fetchError && <Alert severity="error">{fetchError}</Alert>}
        {fetchLoading ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography>Загрузка...</Typography>
          </Box>
        ) : (
          <>
            <UserTableToolbar
              filterName={filterName}
              onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
                setFilterName(event.target.value);
                table.onResetPage();
              }}
            />
            <Scrollbar>
              <TableContainer sx={{ overflow: 'unset' }}>
                <Table sx={{ minWidth: 800 }}>
                  <UserTableHead
                    order={table.order}
                    orderBy={table.orderBy}
                    onSort={table.onSort}
                    headLabel={[
                      { id: 'name', label: 'Имя' },
                      { id: 'company', label: 'Точка' },
                      { id: 'phone', label: 'Телефон' },
                      { id: 'role', label: 'Роль' },
                      { id: '' },
                    ]}
                  />
                  <TableBody>
                    {dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row) => (
                        <UserTableRow
                          key={row.id}
                          row={row}
                        />
                      ))}

                    <TableEmptyRows
                      height={68}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, users.length)}
                    />

                    {notFound && <TableNoData searchQuery={filterName} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
            <TablePagination
              component="div"
              page={table.page}
              count={users.length}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={table.onChangeRowsPerPage}
            />
          </>
        )}
      </Card>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    rowsPerPage,
    onResetPage,
    onChangePage,
    onChangeRowsPerPage,
  };
}
