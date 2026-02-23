import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { ShelterService } from '../../services/shelter.service';

@Component({
  selector: 'app-create-shelter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-shelter.html',
  styleUrl: './create-shelter.scss',
})
export class CreateShelter {
  private readonly router = inject(Router);
  private readonly shelterService = inject(ShelterService);

  logoFile: File | null = null;
  isSubmitting = false;
  errorMessage = '';

  form = new FormGroup({
    address: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    iban: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
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

    this.shelterService
      .createShelter({
        address: v.address,
        name: v.name,
        iban: v.iban,
        logo: this.logoFile,
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (created) => this.router.navigate(['/shelter', created.id]),
        error: (err) => {
          this.errorMessage =
            err?.error?.message ||
            err?.error?.error ||
            (err.status ? `Failed (${err.status})` : 'Failed to create shelter.');
        },
      });
  }
}
