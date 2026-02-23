import { Routes } from '@angular/router';

import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';

import { CreateBusiness } from './pages/create-business/create-business';
import { CreateShelter } from './pages/create-shelter/create-shelter';

import { BusinessPage } from './pages/business/business';
import { ShelterPage } from './pages/shelter/shelter';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'register', component: Register },
  { path: 'login', component: Login },

  { path: 'home', component: Home },

  { path: 'create-business', component: CreateBusiness },
  { path: 'create-shelter', component: CreateShelter },

  { path: 'business/:id', component: BusinessPage },
  { path: 'shelter/:id', component: ShelterPage },

  { path: '**', redirectTo: 'login' },
];
