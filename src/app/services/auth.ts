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
  private decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

      const json = atob(padded);
      return JSON.parse(json) as Record<string, unknown>;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  getCurrentUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = this.decodeJwtPayload(token);
    if (!payload) return null;

    const possibleKeys = [
      'nameid',
      'sub',
      'userId',
      'id',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
    ];

    const data = payload as Record<string, unknown>;

    for (const key of possibleKeys) {
      const value = data[key];

      if (typeof value === 'string' && value.length > 0) {
        return value;
      }
    }

    return null;
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
