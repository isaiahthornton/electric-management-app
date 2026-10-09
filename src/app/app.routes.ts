import { Routes } from '@angular/router';
import { Landing } from './components/landing/landing';
import { Login } from './components/login/login';
import { About } from './components/about/about';
import { Contact } from './components/contact/contact';
import { Register } from './components/register/register';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Landing, title: 'Thornton Energy' },
  { path: 'login', component: Login, title: 'Login | Thornton Energy' },
  { path: 'about', component: About, title: 'About | Thornton Energy' },
  { path: 'contact', component: Contact, title: 'Contact | Thornton Energy' },
  { path: 'register', component: Register, title: 'Register | Thornton Energy' },
  {
    path: 'account',
    loadComponent: () => import('./components/account/account-layout/account-layout').then((m) => m.AccountLayout),
    canActivate: [authGuard],
    data: { role: 'customer' },
    children: [
      {
        path:'',
        loadComponent: () => import('./components/account/account-dashboard/account-dashboard').then((m) => m.AccountDashboard),
        title: 'My Account | Thornton Energy',
      },
      {
        path: 'usage',
        loadComponent: () =>
          import('./components/account/usage-history/usage-history').then((m) => m.UsageHistory),
        title: 'Usage | Thornton Energy',
      },
      {
        path: 'billing',
        loadComponent: () =>
          import('./components/account/billing-history/billing-history').then((m) => m.BillingHistory),
        title: 'Billing | Thornton Energy',
      },
      {
        path: 'billing/:id',
        loadComponent: () =>
          import('./components/account/bill-detail/bill-detail').then((m) => m.BillDetail),
        title: 'Bill Details | Thornton Energy',
      },
      {
        path: 'outages',
        loadComponent: () =>
          import('./components/account/customer-outages/customer-outages').then((m) => m.CustomerOutages),
        title: 'Outages | Thornton Energy',
      },
    ]
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin-layout/admin-layout').then((m) => m.AdminLayout),
    canActivate: [authGuard],
    data: { role: 'admin' },
    children: [
      {
        path: '',
        loadComponent: () => import('./components/admin/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
        title: 'Admin Dashboard | Thornton Energy',
      }
    ]
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/not-found/not-found').then((m) => m.NotFound),
    title: '404: Page Not Found | Thornton Energy',
  }
];
