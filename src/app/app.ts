import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { ActiveProfileService } from './services/active-profile.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);
  readonly profiles = inject(ActiveProfileService);

  private get cleanUrl(): string {
    const url = this.router.url || '';
    return url.split('?')[0];
  }

  get isLoginPage(): boolean {
    const url = this.cleanUrl;
    return url === '/login' || url.startsWith('/login/');
  }

  get isRegisterPage(): boolean {
    const url = this.cleanUrl;
    return url === '/register' || url.startsWith('/register/');
  }

  get isAuthPage(): boolean {
    return this.isLoginPage || this.isRegisterPage;
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  goLogin(): void {
    this.router.navigate(['/login']);
  }

  goRegister(): void {
    this.router.navigate(['/register']);
  }

  goCreatePost(): void {
    const a = this.profiles.active();

    if (a.type === 'business') {
      this.router.navigate(['/create-business-post']);
      return;
    }

    if (a.type === 'shelter') {
      this.router.navigate(['/create-shelter-post']);
      return;
    }

    this.router.navigate(['/create-lost-animal']);
  }

  goCreateBusiness(): void {
    this.router.navigate(['/create-business']);
  }

  goCreateShelter(): void {
    this.router.navigate(['/create-shelter']);
  }

  goBackProfile(): void {
    const prev = this.profiles.goBack();

    if (prev.type === 'business' && prev.id != null) {
      this.router.navigate(['/business', prev.id]);
      return;
    }

    if (prev.type === 'shelter' && prev.id != null) {
      this.router.navigate(['/shelter', prev.id]);
      return;
    }

    this.router.navigate(['/me']);
  }

  goMyProfile(): void {
    const a = this.profiles.active();

    if (a.type === 'business' && a.id != null) {
      this.router.navigate(['/business', a.id]);
      return;
    }

    if (a.type === 'shelter' && a.id != null) {
      this.router.navigate(['/shelter', a.id]);
      return;
    }

    this.router.navigate(['/me']);
  }
}
