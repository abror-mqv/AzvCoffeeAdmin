import { CONFIG } from 'src/config-global';

import { FeedbacksView } from 'src/sections/feedbacks';

export default function Page() {
  return (
    <>
      <title>{`Отзывы - ${CONFIG.appName}`}</title>
      <FeedbacksView />
    </>
  );
}
