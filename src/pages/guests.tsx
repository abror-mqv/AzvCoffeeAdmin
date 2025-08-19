import { CONFIG } from 'src/config-global';

import { GuestsView } from 'src/sections/guests';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Клиенты - ${CONFIG.appName}`}</title>

      <GuestsView />
    </>
  );
}
