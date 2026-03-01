import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ActiveProfileService } from '../../services/active-profile.service';

interface CreateShelterResponse {
  id?: number;
  shelterId?: number;
}

@Component({
  selector: 'app-create-shelter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-shelter.html',
  styleUrl: './create-shelter.scss',
})
export class CreateShelter {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly profiles = inject(ActiveProfileService);

  isSubmitting = false;
  errorMessage = '';

  private logoFile: File | null = null;

  form = new FormGroup({
    address: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(256)],
    }),
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(256)],
    }),
    iban: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10), Validators.maxLength(64)],
    }),
  });

  goHome(): void {
    this.router.navigate(['/home']);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.logoFile = input.files?.[0] ?? null;
  }

  submit(): void {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    const fd = new FormData();
    fd.append('address', v.address.trim());
    fd.append('name', v.name.trim());
    fd.append('iban', v.iban.trim());

    if (this.logoFile) {
      fd.append('logo', this.logoFile);
    }

    this.isSubmitting = true;
    this.form.disable();

    this.http
      .post<CreateShelterResponse>('/api/profiles/shelter', fd)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          const idRaw = res?.id ?? res?.shelterId ?? null;
          const id = idRaw != null ? Number(idRaw) : null;

          if (id != null && Number.isFinite(id)) {
            localStorage.setItem('petverse_last_shelter_id', String(id));
            this.profiles.setShelterAsActive(id, true);

            this.router.navigate(['/shelter', id]);
            return;
          }

          this.router.navigate(['/me']);
        },
        error: (err) => {
          const status = err?.status;
          const msg =
            err?.error?.message ||
            err?.error?.error ||
            (typeof err?.error === 'string' ? err.error : '') ||
            'Failed to create shelter.';
          this.errorMessage = status ? `Failed (${status}) ${msg}` : msg;
        },
      });
  }
}
