import { CONFIG } from 'src/config-global';

import { BranchesView } from 'src/sections/branches/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Заведения - ${CONFIG.appName}`}</title>

      <BranchesView />
    </>
  );
}
