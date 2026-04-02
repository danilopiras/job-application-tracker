import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/layout/shell.layout').then((m) => m.ShellLayout),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'applications/new',
        loadComponent: () =>
          import('./features/applications/application-form.page').then((m) => m.ApplicationFormPage),
      },
      {
        path: 'applications/:id/edit',
        loadComponent: () =>
          import('./features/applications/application-form.page').then((m) => m.ApplicationFormPage),
      },
      {
        path: 'applications/:id',
        loadComponent: () =>
          import('./features/applications/application-detail.page').then((m) => m.ApplicationDetailPage),
      },
      {
        path: 'applications',
        loadComponent: () =>
          import('./features/applications/applications.page').then((m) => m.ApplicationsPage),
      },
      {
        path: 'interviews',
        loadComponent: () => import('./features/interviews/interviews.page').then((m) => m.InterviewsPage),
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.page').then((m) => m.SettingsPage),
      },
    ],
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./core/layout/auth-shell.layout').then((m) => m.AuthShellLayout),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/auth/reset-password.page').then((m) => m.ResetPasswordPage),
      },
    ],
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
