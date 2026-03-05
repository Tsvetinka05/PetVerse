import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core';

import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { Me } from './pages/me/me';
import { CreateBusiness } from './pages/create-business/create-business';
import { CreateShelter } from './pages/create-shelter/create-shelter';
import { CreateLostAnimalPost } from './pages/create-lost-animal-post/create-lost-animal-post';
import { CreateBusinessPost } from './pages/create-business-post/create-business-post';
import { CreateShelterPost } from './pages/create-shelter-post/create-shelter-post';
import { AuthService } from './services/auth';

const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'register', component: Register },
  { path: 'login', component: Login },

  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: 'me', component: Me, canActivate: [authGuard] },

  { path: 'create-business', component: CreateBusiness, canActivate: [authGuard] },
  { path: 'create-shelter', component: CreateShelter, canActivate: [authGuard] },

  { path: 'create-lost-animal-post', component: CreateLostAnimalPost, canActivate: [authGuard] },
  { path: 'create-business-post', component: CreateBusinessPost, canActivate: [authGuard] },
  { path: 'create-shelter-post', component: CreateShelterPost, canActivate: [authGuard] },

  {
    path: 'business/:id',
    loadComponent: () => import('./pages/business/business').then((m) => m.BusinessPage),
    canActivate: [authGuard],
  },
  {
    path: 'shelter/:id',
    loadComponent: () => import('./pages/shelter/shelter').then((m) => m.ShelterPage),
    canActivate: [authGuard],
  },

  { path: '**', redirectTo: 'home' },
];
