import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface RegisterRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email: string;
  pet?: {
    name: string;
    kind: string;
    birthDate: string;
  };
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly TOKEN_KEY = 'petverse_token';

  // 🔥 Вече НЕ използваме API_BASE_URL
  private readonly REGISTER_URL = '/api/accounts/register';
  private readonly LOGIN_URL = '/api/accounts/login';

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.REGISTER_URL, payload).pipe(
      tap((res) => {
        if (res?.token) this.setToken(res.token);
      }),
    );
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(this.LOGIN_URL, payload)
      .pipe(tap((res) => this.setToken(res.token)));
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
