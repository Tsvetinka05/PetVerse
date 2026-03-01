import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.endsWith('/api/accounts/login') || req.url.endsWith('/api/accounts/register')) {
    return next(req);
  }

  const auth = inject(AuthService);
  const token = auth.getToken();

  if (!token) return next(req);

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
