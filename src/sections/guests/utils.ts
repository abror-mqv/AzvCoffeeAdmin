import type { CSSObject } from '@mui/material/styles';

import type { GuestProps } from './guest-table-row';

// ----------------------------------------------------------------------

export const visuallyHidden: CSSObject = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
};

// ----------------------------------------------------------------------

export function emptyRows(page: number, rowsPerPage: number, arrayLength: number) {
  return Math.max(0, page > 0 ? rowsPerPage - arrayLength : 0);
}

function descendingComparator(a: GuestProps, b: GuestProps, orderBy: string) {
  if (orderBy === 'points') {
    return b.points - a.points;
  }
  
  if (orderBy === 'coffee_count') {
    return b.coffee_count - a.coffee_count;
  }
  
  if (orderBy === 'total_spent') {
    return b.total_spent - a.total_spent;
  }
  
  if (orderBy === 'registration_date' || orderBy === 'lastVisit') {
    const dateA = orderBy === 'registration_date' ? a.registration_date : a.lastVisit || '';
    const dateB = orderBy === 'registration_date' ? b.registration_date : b.lastVisit || '';
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  }
  
  if (orderBy === 'first_name' || orderBy === 'last_name' || orderBy === 'phone' || orderBy === 'rank') {
    const valueA = String(a[orderBy as keyof GuestProps] || '').toLowerCase();
    const valueB = String(b[orderBy as keyof GuestProps] || '').toLowerCase();
    return valueB.localeCompare(valueA);
  }
  
  return 0;
}

export function getComparator(order: 'asc' | 'desc', orderBy: string) {
  return order === 'desc'
    ? (a: GuestProps, b: GuestProps) => descendingComparator(a, b, orderBy)
    : (a: GuestProps, b: GuestProps) => -descendingComparator(a, b, orderBy);
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  inputData: GuestProps[];
  comparator: (a: GuestProps, b: GuestProps) => number;
  filterName: string;
};

export function applyFilter({ inputData, comparator, filterName }: ApplyFilterProps) {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    inputData = inputData.filter(
      (guest) => {
        const fullName = `${guest.first_name} ${guest.last_name}`.toLowerCase();
        const nameMatch = fullName.indexOf(filterName.toLowerCase()) !== -1;
        const phoneMatch = guest.phone.toLowerCase().indexOf(filterName.toLowerCase()) !== -1;
        return nameMatch || phoneMatch;
      }
    );
  }

  return inputData;
}