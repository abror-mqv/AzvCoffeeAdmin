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
import Alert from '@mui/material/Alert';

import axios from 'axios';
import { API_BASE_URL } from 'src/config-global';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from '../table-no-data';
import { BranchTableRow } from '../branch-table-row';
import { BranchTableHead } from '../branch-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { BranchTableToolbar } from '../branch-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { BranchProps } from '../branch-table-row';

// ----------------------------------------------------------------------

export function BranchesView() {
  const table = useTable();
  const [filterName, setFilterName] = useState('');

  // Данные заведений с бэка
  const [branches, setBranches] = useState<BranchProps[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Модалка создания заведения
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newLatitude, setNewLatitude] = useState('');
  const [newLongitude, setNewLongitude] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    setNewName('');
    setNewAddress('');
    setNewLatitude('');
    setNewLongitude('');
    setError(null);
    setSuccess(false);
  };
  const handleClose = () => {
    setOpen(false);
    setError(null);
    setSuccess(false);
  };

  const loadBranches = () => {
    setFetchLoading(true);
    setFetchError(null);
    const token = localStorage.getItem('authToken');
    axios.get(`${API_BASE_URL}/api/coffeeshops/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then(res => {
        // Приводим данные к BranchProps
        setBranches(
          Array.isArray(res.data)
            ? res.data.map((item: any) => ({
                id: String(item.id),
                name: item.name,
                address: item.address,
                employeesCount: item.staff_count,
                contactPerson: item.responsible_senior_barista || '-',
                bonuses: item.bonuses || 0,
                latitude: item.latitude,
                longitude: item.longitude,
                opening_hours: item.opening_hours,
                responsible_senior_barista_phone: item.responsible_senior_barista_phone,
              }))
            : []
        );
        setFetchLoading(false);
      })
      .catch(err => {
        setFetchError('Ошибка загрузки заведений');
        setFetchLoading(false);
      });
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleCreate = () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    const token = localStorage.getItem('authToken');
    
    const data: any = {
      name: newName,
      address: newAddress,
    };
    
    // Добавляем координаты только если они заполнены
    if (newLatitude) {
      data.latitude = parseFloat(newLatitude);
    }
    
    if (newLongitude) {
      data.longitude = parseFloat(newLongitude);
    }
    
    axios.post(`${API_BASE_URL}/api/manager/register-coffeeshop/`, data, {
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
          loadBranches(); // Перезагружаем список заведений после создания
        }, 1000);
      })
      .catch(err => {
        setError(err?.response?.data?.detail || err?.response?.data?.error || 'Ошибка создания заведения');
        setLoading(false);
      });
  };

  const dataFiltered: BranchProps[] = applyFilter({
    inputData: branches,
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
          Заведения
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpen}
        >
          Новое заведение
        </Button>
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Новое заведение</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>Заведение успешно создано!</Alert>}
          <TextField
            fullWidth
            label="Название"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Адрес"
            value={newAddress}
            onChange={e => setNewAddress(e.target.value)}
            sx={{ mb: 2 }}
            disabled={loading}
          />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Широта"
              value={newLatitude}
              onChange={e => setNewLatitude(e.target.value)}
              disabled={loading}
              type="number"
              inputProps={{ step: 'any' }}
              placeholder="Например: 55.754167"
            />
            <TextField
              fullWidth
              label="Долгота"
              value={newLongitude}
              onChange={e => setNewLongitude(e.target.value)}
              disabled={loading}
              type="number"
              inputProps={{ step: 'any' }}
              placeholder="Например: 37.62"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>Отмена</Button>
          <Button onClick={handleCreate} variant="contained" color="primary" disabled={loading || !newName || !newAddress}>
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
            <BranchTableToolbar
              filterName={filterName}
              onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
                setFilterName(event.target.value);
                table.onResetPage();
              }}
            />

            <Scrollbar>
              <TableContainer sx={{ overflow: 'unset' }}>
                <Table sx={{ minWidth: 800 }}>
                  <BranchTableHead
                    order={table.order}
                    orderBy={table.orderBy}
                    onSort={table.onSort}
                    headLabel={[
                      { id: 'name', label: 'Название' },
                      { id: 'address', label: 'Адрес' },
                      { id: 'employeesCount', label: 'Кол-во сотрудников' },
                      { id: 'responsible_senior_barista_phone', label: 'Контакт ответственного' },
                      { id: 'bonuses', label: 'Бонусы' },
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
                        <BranchTableRow
                          key={row.id}
                          row={row}
                          onEditSuccess={loadBranches}
                        />
                      ))}

                    <TableEmptyRows
                      height={68}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, branches.length)}
                    />

                    {notFound && <TableNoData searchQuery={filterName} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              component="div"
              page={table.page}
              count={branches.length}
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