import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';

import { ActiveProfileService } from './active-profile.service';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  jwtToken: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  pet?: {
    name: string;
    kind: string;
    birthDate: string;
  };
}

export interface RegisterResponse {
  jwtToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'petverse_token';
  private readonly http = inject(HttpClient);
  private readonly profiles = inject(ActiveProfileService);

  private readonly baseUrl = '';

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    this.clearToken();
    this.profiles.clearAll();
  }

  private parseJwtToken(text: string): string {
    const trimmed = (text ?? '').trim();

    if (trimmed.startsWith('{')) {
      try {
        const obj = JSON.parse(trimmed);
        const token = obj?.jwtToken;
        if (typeof token === 'string' && token.length > 0) return token;
      } catch (err) {
        console.error(err);
      }
    }

    return trimmed;
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post(`${this.baseUrl}/api/accounts/login`, payload, { responseType: 'text' })
      .pipe(
        map((text) => ({ jwtToken: this.parseJwtToken(text) }) as LoginResponse),
        tap((res) => {
          if (res.jwtToken) this.setToken(res.jwtToken);
        }),
      );
  }

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.http
      .post(`${this.baseUrl}/api/accounts/register`, payload, { responseType: 'text' })
      .pipe(
        map((text) => ({ jwtToken: this.parseJwtToken(text) }) as RegisterResponse),
        tap((res) => {
          if (res.jwtToken) this.setToken(res.jwtToken);
        }),
      );
  }
}
