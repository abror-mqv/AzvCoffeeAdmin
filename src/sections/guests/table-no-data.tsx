import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

type TableNoDataProps = {
  searchQuery?: string;
};

export function TableNoData({ searchQuery }: TableNoDataProps) {
  return (
    <TableRow>
      <TableCell colSpan={6} sx={{ py: 3 }}>
        <Box
          sx={{
            textAlign: 'center',
            '& img': {
              height: 160,
              mx: 'auto',
            },
          }}
        >
          <Typography variant="h6" paragraph>
            Не найдено
          </Typography>

          <Typography variant="body2">
            {searchQuery ? `Нет результатов для &nbsp;` : ''}
            {searchQuery && (
              <strong>&quot;{searchQuery}&quot;</strong>
            )}
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
} 