import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { BusinessService } from '../../services/business.service';
import { ActiveProfileService } from '../../services/active-profile.service';

@Component({
  selector: 'app-create-business',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-business.html',
  styleUrl: './create-business.scss',
})
export class CreateBusiness {
  private readonly router = inject(Router);
  private readonly businessService = inject(BusinessService);
  private readonly profiles = inject(ActiveProfileService);

  logoFile: File | null = null;
  isSubmitting = false;
  errorMessage = '';

  form = new FormGroup({
    address: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    identificationNumber: new FormControl<string>('', { nonNullable: true }),
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
      this.errorMessage = 'Please fill all required fields.';
      return;
    }

    if (!this.logoFile) {
      this.errorMessage = 'Please choose a logo file.';
      return;
    }

    const v = this.form.getRawValue();

    this.isSubmitting = true;

    this.businessService
      .createBusiness({
        address: v.address,
        name: v.name,
        description: v.description,
        identificationNumber: v.identificationNumber?.trim() || undefined,
        logo: this.logoFile,
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (created) => {
          const id = typeof created.id === 'string' ? Number(created.id) : created.id;
          this.profiles.switchTo({ type: 'business', id }, true);
          this.router.navigate(['/business', id]);
          this.router.navigate(['/business', created.id]);
        },
        error: (err) => {
          this.errorMessage =
            err?.error?.message ||
            err?.error?.error ||
            (typeof err?.error === 'string' ? err.error : '') ||
            (err.status ? `Failed (${err.status})` : 'Failed to create business.');
        },
      });
  }
}
