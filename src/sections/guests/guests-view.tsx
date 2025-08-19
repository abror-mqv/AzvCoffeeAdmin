import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Alert from '@mui/material/Alert';
import axios from 'axios';
import { API_BASE_URL } from 'src/config-global';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from './table-no-data';
import { GuestTableRow } from './guest-table-row';
import { GuestTableHead } from './guest-table-head';
import { TableEmptyRows } from './table-empty-rows';
import { GuestTableToolbar } from './guest-table-toolbar';
import { emptyRows, applyFilter, getComparator } from './utils';

import type { GuestProps } from './guest-table-row';

// ----------------------------------------------------------------------

// Интерфейс для ответа API
interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiGuest[];
}

// Интерфейс для гостя из API
interface ApiGuest {
  id: number;
  phone: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  points: number;
  coffee_count: number;
  total_spent: number;
  total_spent_rubles: number;
  free_coffee_count: number;
  registration_date: string;
  rank: string;
  cashback_percent: number;
  next_rank: string;
  progress_to_next_percent: number;
  rank_color?: string;
  rank_icon?: string;
}

export function GuestsView() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [filterName, setFilterName] = useState('');
  const [minSpent, setMinSpent] = useState<string>('');
  const [minCoffee, setMinCoffee] = useState<string>('');
  
  // Состояния для данных с API
  const [guests, setGuests] = useState<GuestProps[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Функция для загрузки данных с API
  const loadGuests = useCallback(() => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('authToken');

    // Формируем параметры запроса
    const params = new URLSearchParams();
    params.append('page', String(page + 1)); // API использует 1-based индексацию
    params.append('page_size', String(rowsPerPage));

    if (filterName) {
      params.append('search', filterName);
    }

    if (minSpent) {
      params.append('min_spent', minSpent);
    }

    if (minCoffee) {
      params.append('min_coffee', minCoffee);
    }

    axios.get<ApiResponse>(`${API_BASE_URL}/api/clients/?${params.toString()}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then(res => {
        // Преобразуем данные из API в формат GuestProps
        const guestsData: GuestProps[] = res.data.results.map(guest => ({
          id: guest.id,
          phone: guest.phone,
          first_name: guest.first_name,
          last_name: guest.last_name,
          birth_date: guest.birth_date,
          points: guest.points,
          coffee_count: guest.coffee_count,
          total_spent: guest.total_spent,
          total_spent_rubles: guest.total_spent_rubles,
          free_coffee_count: guest.free_coffee_count,
          registration_date: guest.registration_date,
          rank: guest.rank,
          cashback_percent: guest.cashback_percent,
          next_rank: guest.next_rank,
          progress_to_next_percent: guest.progress_to_next_percent,
          rank_color: guest.rank_color,
          rank_icon: guest.rank_icon,
          lastVisit: guest.registration_date, // Используем дату регистрации, если нет даты последнего посещения
        }));

        setGuests(guestsData);
        setTotalCount(res.data.count);
        setLoading(false);
      })
      .catch(err => {
        setError(err?.response?.data?.detail || 'Ошибка загрузки данных');
        setLoading(false);
      });
  }, [page, rowsPerPage, filterName, minSpent, minCoffee]);



  // Загружаем данные при изменении параметров
  useEffect(() => {
    loadGuests();
  }, [loadGuests]);

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
      setPage(0);
    },
    []
  );

  // Применяем локальную сортировку к данным
  const sortedGuests = [...guests].sort((a, b) => {
    const comparator = getComparator(order, orderBy);
    return comparator(a, b);
  });

  const notFound = !sortedGuests.length && !!filterName;

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
          Гости (держатели приложения)
        </Typography>
      </Box>

      <Card>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <GuestTableToolbar
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            onResetPage();
          }}
          minSpent={minSpent}
          onMinSpentChange={(value) => {
            setMinSpent(value);
            onResetPage();
          }}
          minCoffee={minCoffee}
          onMinCoffeeChange={(value) => {
            setMinCoffee(value);
            onResetPage();
          }}
          onApplyFilters={loadGuests}
        />

        {loading ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography>Загрузка...</Typography>
          </Box>
        ) : (
          <>
            <Scrollbar>
              <TableContainer sx={{ overflow: 'unset' }}>
                <Table sx={{ minWidth: 800 }}>
                  <GuestTableHead
                    order={order}
                    orderBy={orderBy}
                    onSort={onSort}
                    headLabel={[
                      { id: 'name', label: 'Имя' },
                      { id: 'phone', label: 'Телефон' },
                      { id: 'balance', label: 'Баланс бонусов' },
                      { id: 'coffeeCount', label: 'Кол-во кофе' },
                      { id: 'totalSpent', label: 'Потрачено (сом)' },
                      { id: 'lastVisit', label: 'Дата регистрации' },
                      { id: 'status', label: 'Статус' },
                      { id: '' },
                    ]}
                  />
                  <TableBody>
                    {sortedGuests.map((row) => (
                      <GuestTableRow
                        key={row.id}
                        row={row}
                      />
                    ))}

                    <TableEmptyRows
                      height={68}
                      emptyRows={emptyRows(page, rowsPerPage, sortedGuests.length)}
                    />

                    {notFound && <TableNoData searchQuery={filterName} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              component="div"
              page={page}
              count={totalCount}
              rowsPerPage={rowsPerPage}
              onPageChange={onChangePage}
              rowsPerPageOptions={[10, 25, 50, 100]}
              onRowsPerPageChange={onChangeRowsPerPage}
            />
          </>
        )}
      </Card>
    </DashboardContent>
  );
} 