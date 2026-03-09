import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  errorMessage = '';
  isSubmitting = false;

  loginForm = new FormGroup({
    username: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(256)],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(256)],
    }),
  });

  onSubmit(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Please fix the highlighted fields.';
      return;
    }

    const payload = this.loginForm.getRawValue();

    this.isSubmitting = true;
    this.loginForm.disable();

    this.auth
      .login(payload)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.loginForm.enable();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.errorMessage = this.extractLoginErrorMessage(err);
          this.snackBar.open(this.errorMessage, 'OK', { duration: 3500 });
        },
      });
  }

  private extractLoginErrorMessage(err: unknown): string {
    const error = err as {
      status?: number;
      error?: unknown;
      message?: string;
    };

    if (error?.status === 401) {
      return 'Wrong username or password.';
    }

    if (typeof error?.error === 'string') {
      const text = error.error.trim();

      if (text.length > 0 && !text.toLowerCase().startsWith('http failure response')) {
        return text;
      }
    }

    if (error?.error && typeof error.error === 'object') {
      const body = error.error as Record<string, unknown>;

      const candidates = [body['message'], body['error'], body['title'], body['detail']];

      for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.trim().length > 0) {
          return candidate;
        }
      }
    }

    return 'Wrong username or password.';
  }
}
