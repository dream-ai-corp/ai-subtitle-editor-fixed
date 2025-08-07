// App-specific routes - these take priority over template routes
// Add your application-specific routes here

import type { RouteRecordRaw } from 'vue-router';

const appRoutes: RouteRecordRaw[] = [
  // Example app-specific route:
  // {
  //   path: '/my-app-page',
  //   component: () => import('../app/layouts/AppLayout.vue'),
  //   children: [
  //     {
  //       path: '',
  //       name: 'my-app-page',
  //       component: () => import('../app/pages/MyAppPage.vue')
  //     }
  //   ]
  // }
];

export default appRoutes;
