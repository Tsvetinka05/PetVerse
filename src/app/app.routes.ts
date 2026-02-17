import { Routes } from '@angular/router';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { ChooseProfile } from './pages/choose-profile/choose-profile';
import { CreateBusiness } from './pages/create-business/create-business';
import { CreateShelter } from './pages/create-shelter/create-shelter';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'register', component: Register },
  { path: 'login', component: Login },

  { path: 'choose-profile', component: ChooseProfile },
  { path: 'create-business', component: CreateBusiness },
  { path: 'create-shelter', component: CreateShelter },

  {
    path: 'business/:id',
    loadComponent: () => import('./pages/business/business').then((m) => m.Business),
  },
  {
    path: 'shelter/:id',
    loadComponent: () => import('./pages/shelter/shelter').then((m) => m.Shelter),
  },

  { path: '**', redirectTo: 'login' },
];
