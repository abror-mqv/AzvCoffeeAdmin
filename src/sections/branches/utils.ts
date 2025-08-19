import type { CSSObject } from '@mui/material/styles';

import type { BranchProps } from './branch-table-row';

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

export function getComparator(order: 'asc' | 'desc', orderBy: string) {
  return order === 'desc'
    ? (a: BranchProps, b: BranchProps) => descendingComparator(a, b, orderBy)
    : (a: BranchProps, b: BranchProps) => -descendingComparator(a, b, orderBy);
}

// ----------------------------------------------------------------------

function descendingComparator(a: BranchProps, b: BranchProps, orderBy: string) {
  // Обработка специальных полей
  if (orderBy === 'responsible_senior_barista_phone') {
    const valueA = a.responsible_senior_barista_phone || '';
    const valueB = b.responsible_senior_barista_phone || '';
    return valueA.localeCompare(valueB);
  }
  
  // Общая обработка для строковых и числовых полей
  if (orderBy in a && orderBy in b) {
    const valueA = a[orderBy as keyof BranchProps];
    const valueB = b[orderBy as keyof BranchProps];
    
    // Обрабатываем строки и числа отдельно
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return valueA.localeCompare(valueB);
    }
    
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return valueB - valueA;
    }
  }
  
  return 0;
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  inputData: BranchProps[];
  comparator: (a: BranchProps, b: BranchProps) => number;
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
      (branch) => {
        const nameMatch = branch.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1;
        const addressMatch = branch.address.toLowerCase().indexOf(filterName.toLowerCase()) !== -1;
        const phoneMatch = branch.responsible_senior_barista_phone ? 
          branch.responsible_senior_barista_phone.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 : false;
        
        return nameMatch || addressMatch || phoneMatch;
      }
    );
  }

  return inputData;
}
