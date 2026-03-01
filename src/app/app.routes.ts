import { Routes } from '@angular/router';

import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';

import { CreateBusiness } from './pages/create-business/create-business';
import { CreateShelter } from './pages/create-shelter/create-shelter';

import { BusinessPage } from './pages/business/business';
import { ShelterPage } from './pages/shelter/shelter';

import { Me } from './pages/me/me';

import { CreateBusinessPost } from './pages/create-business-post/create-business-post';
import { CreateLostAnimalPost } from './pages/create-lost-animal-post/create-lost-animal-post';
import { CreateShelterPost } from './pages/create-shelter-post/create-shelter-post';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'register', component: Register },
  { path: 'login', component: Login },

  { path: 'home', component: Home },

  { path: 'create-business', component: CreateBusiness },
  { path: 'create-shelter', component: CreateShelter },

  { path: 'me', component: Me },

  { path: 'business/:id', component: BusinessPage },
  { path: 'shelter/:id', component: ShelterPage },

  // create post pages
  { path: 'create-business-post', component: CreateBusinessPost },
  { path: 'create-lost-animal', component: CreateLostAnimalPost },
  { path: 'create-shelter-post', component: CreateShelterPost },

  { path: '**', redirectTo: 'home' },
];
