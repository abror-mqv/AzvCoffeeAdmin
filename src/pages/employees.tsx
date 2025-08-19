import { CONFIG } from 'src/config-global';

import { EmployeesView } from 'src/sections/emploees/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Персонал - ${CONFIG.appName}`}</title>

      <EmployeesView />
    </>
  );
}
