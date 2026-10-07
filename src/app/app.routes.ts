import { Routes } from '@angular/router';
import { Landing } from './components/landing/landing';
import { Login } from './components/login/login';
import { About } from './components/about/about';
import { Contact } from './components/contact/contact';

export const routes: Routes = [
  { path: '', component: Landing, title: 'Thornton Energy' },
  { path: 'login', component: Login, title: 'Login | Thornton Energy' },
  { path: 'about', component: About, title: 'About | Thornton Energy' },
  { path: 'contact', component: Contact, title: 'Contact | Thornton Energy' },
  {
    path: '**',
    loadComponent: () =>
      import('./components/not-found/not-found').then((m) => m.NotFound),
    title: '404: Page Not Found | Thornton Energy',
  }
];
