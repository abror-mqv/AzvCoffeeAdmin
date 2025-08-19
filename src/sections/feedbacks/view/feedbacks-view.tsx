import { useEffect, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';

import axios from 'axios';
import { API_BASE_URL } from 'src/config-global';

import { DashboardContent } from 'src/layouts/dashboard';

import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from 'src/sections/branches/table-no-data';
import { TableEmptyRows } from 'src/sections/branches/table-empty-rows';
import { emptyRows } from 'src/sections/branches/utils';

import { FeedbackTableHead } from 'src/sections/feedbacks/feedback-table-head';
import { FeedbackTableRow } from 'src/sections/feedbacks/feedback-table-row';
import { FeedbackTableToolbar } from 'src/sections/feedbacks/feedback-table-toolbar';

export type FeedbackItem = {
  id: number;
  type: 'service' | 'idea';
  text: string;
  created_at: string; // ISO 8601
  user: { id: number; phone: string; first_name?: string; last_name?: string };
  coffee_shop: { id: number; name: string };
};

export function FeedbacksView() {
  const table = useTable();

  const [filterText, setFilterText] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'service' | 'idea'>('all');
  const [filterCoffeeShopId, setFilterCoffeeShopId] = useState<number | 'all'>('all');

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [shops, setShops] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadShops = () => {
    const token = localStorage.getItem('authToken');
    axios
      .get(`${API_BASE_URL}/api/coffeeshops/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data.map((s: any) => ({ id: Number(s.id), name: s.name as string }))
          : [];
        setShops(list);
      })
      .catch(() => {
        // ignore shop load errors in UI
      });
  };

  const loadFeedbacks = useCallback(() => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('authToken');

    const params: any = {};
    if (filterType !== 'all') params.type = filterType;
    if (filterCoffeeShopId !== 'all') params.coffee_shop_id = filterCoffeeShopId;

    axios
      .get(`${API_BASE_URL}/api/feedbacks/`, {
        headers: { Authorization: `Token ${token}` },
        params,
      })
      .then((res) => {
        setFeedbacks(Array.isArray(res.data) ? (res.data as FeedbackItem[]) : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err?.response?.data?.error || err?.response?.data?.detail || 'Ошибка загрузки отзывов'
        );
        setLoading(false);
      });
  }, [filterType, filterCoffeeShopId]);

  useEffect(() => {
    loadShops();
  }, []);

  useEffect(() => {
    loadFeedbacks();
  }, [loadFeedbacks]);

  // filter by search text
  const dataFilteredByText: FeedbackItem[] = !filterText
    ? feedbacks
    : feedbacks.filter((item) => {
        const q = filterText.toLowerCase();
        const fullName = `${item.user?.first_name || ''} ${item.user?.last_name || ''}`.trim();
        return (
          item.text?.toLowerCase().includes(q) ||
          fullName.toLowerCase().includes(q) ||
          item.user?.phone?.toLowerCase().includes(q) ||
          item.coffee_shop?.name?.toLowerCase().includes(q)
        );
      });

  // sort
  const dataFiltered: FeedbackItem[] = [...dataFilteredByText].sort((a, b) => {
    const { orderBy, order } = table;
    const dir = order === 'asc' ? 1 : -1;
    switch (orderBy) {
      case 'created_at':
        return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
      case 'type':
        return a.type.localeCompare(b.type) * dir;
      case 'text':
        return (a.text || '').localeCompare(b.text || '') * dir;
      case 'user': {
        const aName = `${a.user?.first_name || ''} ${a.user?.last_name || ''} ${a.user?.phone || ''}`;
        const bName = `${b.user?.first_name || ''} ${b.user?.last_name || ''} ${b.user?.phone || ''}`;
        return aName.localeCompare(bName) * dir;
      }
      case 'coffee_shop':
        return (a.coffee_shop?.name || '').localeCompare(b.coffee_shop?.name || '') * dir;
      default:
        return 0;
    }
  });

  const notFound = !dataFiltered.length && (!!filterText || feedbacks.length > 0);

  return (
    <DashboardContent>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Отзывы
        </Typography>
        <Chip label={`Всего: ${feedbacks.length}`} variant="outlined" />
      </Box>

      <Card>
        {error && <Alert severity="error">{error}</Alert>}
        {loading ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography>Загрузка...</Typography>
          </Box>
        ) : (
          <>
            <FeedbackTableToolbar
              filterText={filterText}
              onFilterText={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFilterText(e.target.value);
                table.onResetPage();
              }}
              filterType={filterType}
              onFilterType={(val: 'all' | 'service' | 'idea') => {
                setFilterType(val);
                table.onResetPage();
              }}
              coffeeShops={shops}
              filterCoffeeShopId={filterCoffeeShopId}
              onFilterCoffeeShop={(val: number | 'all') => {
                setFilterCoffeeShopId(val);
                table.onResetPage();
              }}
              onReload={loadFeedbacks}
            />

            <Scrollbar>
              <TableContainer sx={{ overflow: 'unset' }}>
                <Table sx={{ minWidth: 800 }}>
                  <FeedbackTableHead
                    order={table.order}
                    orderBy={table.orderBy}
                    onSort={table.onSort}
                    headLabel={[
                      { id: 'created_at', label: 'Дата' },
                      { id: 'type', label: 'Тип' },
                      { id: 'text', label: 'Текст' },
                      { id: 'user', label: 'Пользователь' },
                      { id: 'coffee_shop', label: 'Заведение' },
                    ]}
                  />

                  <TableBody>
                    {dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row) => <FeedbackTableRow key={row.id} row={row} />)}

                    <TableEmptyRows
                      height={68}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, feedbacks.length)}
                    />

                    {notFound && <TableNoData searchQuery={filterText} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              component="div"
              page={table.page}
              count={feedbacks.length}
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

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState<'created_at' | 'type' | 'text' | 'user' | 'coffee_shop'>('created_at');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id as any);
    },
    [order, orderBy]
  );

  const onResetPage = useCallback(() => setPage(0), []);
  const onChangePage = useCallback((_: unknown, newPage: number) => setPage(newPage), []);
  const onChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    onResetPage();
  }, [onResetPage]);

  return { page, order, onSort, orderBy, rowsPerPage, onResetPage, onChangePage, onChangeRowsPerPage };
}
