import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ru';

dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.locale('ru');

import type { FeedbackItem } from './view/feedbacks-view';

export function FeedbackTableRow({ row }: { row: FeedbackItem }) {
  const created = dayjs.utc(row.created_at).local();
  return (
    <TableRow hover tabIndex={-1}>
      <TableCell>
        <Typography variant="body2">{created.format('DD.MM.YYYY HH:mm')}</Typography>
        <Typography variant="caption" color="text.secondary">{created.fromNow()}</Typography>
      </TableCell>
      <TableCell>
        <Chip
          size="small"
          label={row.type === 'service' ? 'Обслуживание' : 'Идея'}
          color={row.type === 'service' ? 'info' : 'success'}
          variant="outlined"
        />
      </TableCell>
      <TableCell sx={{ maxWidth: 500 }}>
        <Typography variant="body2" noWrap title={row.text}>{row.text}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          {`${row.user?.first_name || ''} ${row.user?.last_name || ''}`.trim() || 'Гость'}
        </Typography>
        <Typography variant="caption" color="text.secondary">{row.user?.phone}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">{row.coffee_shop?.name}</Typography>
      </TableCell>
    </TableRow>
  );
}
