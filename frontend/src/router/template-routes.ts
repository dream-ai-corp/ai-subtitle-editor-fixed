// Template routes - these are the default routes from the template
// App-specific routes should be defined in app-routes.ts

const templateRoutes = [
  {
    path: '/',
    component: () => import('../template/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('../template/pages/IndexPage.vue'),
      },
      {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('../template/pages/DashboardPage.vue'),
      },
      {
        path: '/api-test',
        name: 'api-test',
        component: () => import('../template/pages/ApiTestPage.vue'),
      },
      {
        path: '/dev-tools',
        name: 'dev-tools',
        component: () => import('../template/pages/DevToolsPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('../template/pages/ErrorNotFound.vue'),
  },
];

export default templateRoutes;
