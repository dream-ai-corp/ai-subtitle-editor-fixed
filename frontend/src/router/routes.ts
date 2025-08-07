import type { RouteRecordRaw } from "vue-router";

/*
 * When adding new routes to this file, remember to include the
 * import to the corresponding type:

 * import "pages/SomePage.vue" -> "src/pages/SomePage.vue"
 * import "layouts/SomeLayout.vue" -> "src/layouts/SomeLayout.vue"
 */

declare module "vue-router" {
  interface RouteMeta {
    requiresAuth?: boolean;
  }
}

// "on-demand" routes
const routes: RouteRecordRaw[] = [
  // Auth pages (no layout) - Login is now the root page
  { path: "/", component: () => import("../template/pages/LoginPage.vue") },
  {
    path: "/register",
    component: () => import("../template/pages/RegisterPage.vue")
  },
  {
    path: "/product-details",
    component: () => import("../template/pages/LandingPage.vue")
  },

  {
    path: "/checkout-login",
    component: () => import("../template/pages/CheckoutLoginPage.vue")
  },
  {
    path: "/auth/callback",
    component: () => import("../template/pages/AuthCallbackPage.vue")
  },
  {
    path: "/payment-success",
    component: () => import("../template/pages/PaymentSuccessPage.vue")
  },

  // Main app pages (with layout)
  {
    path: "/app",
    component: () => import("../template/layouts/MainLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      { path: "", component: () => import("../template/pages/IndexPage.vue") },
      {
        path: "dashboard",
        component: () => import("../template/pages/DashboardPage.vue")
      },
      {
        path: "settings",
        component: () => import("../template/pages/SettingsPage.vue")
      },
      {
        path: "dev-tools",
        component: () => import("../template/pages/DevToolsPage.vue")
      },
      {
        path: "test-panel",
        component: () => import("../template/pages/TestPanelPage.vue")
      },
      {
        path: "theme-manager",
        component: () => import("../template/pages/ThemeManagerPage.vue")
      },
      {
        path: "api-test",
        component: () => import("../template/pages/ApiTestPage.vue")
      },
      {
        path: "deployment",
        component: () => import("../template/pages/DeploymentPage.vue")
      }
    ]
  },

  // Subtitle pages (with layout)
  {
    path: "/subtitle-upload",
    component: () => import("../template/layouts/MainLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        component: () => import("../custom/pages/SubtitleUploadPage.vue")
      }
    ]
  },
  {
    path: "/subtitle-editor/:id",
    component: () => import("../template/layouts/MainLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        component: () => import("../custom/pages/SubtitleEditorPage.vue")
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("../template/pages/ErrorNotFound.vue")
  }
];

export default routes;
