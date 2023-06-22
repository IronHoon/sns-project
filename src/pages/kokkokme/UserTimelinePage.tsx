import React from 'react';

import NavbarLayout from 'components/layouts/NavbarLayout';
import { UserTimeline } from 'views/kokkokme';

function UserTimelinePage() {
  return (
    <NavbarLayout>
      <UserTimeline />
    </NavbarLayout>
  );
}

export default UserTimelinePage;
