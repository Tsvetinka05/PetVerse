import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';

import { AuthService } from '../../services/auth';
import type { RegisterRequest } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private readonly destroyRef = inject(DestroyRef);
  private readonly auth = inject(AuthService);

  errorMessage = '';
  isSubmitting = false;

  petKinds: string[] = ['DOG', 'CAT', 'OTHER'];

  registerForm = new FormGroup(
    {
      firstName: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(256)],
      }),

      lastName: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(256)],
      }),

      username: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(256)],
      }),

      phoneNumber: new FormControl<string>('', { nonNullable: true }), // optional

      email: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),

      password: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8), Validators.maxLength(256)],
      }),

      confirmPassword: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),

      addPetNow: new FormControl<boolean>(false, { nonNullable: true }),

      // pet fields start disabled
      petName: new FormControl<string>({ value: '', disabled: true }, { nonNullable: true }),
      petKind: new FormControl<string>({ value: '', disabled: true }, { nonNullable: true }),
      petBirthDate: new FormControl<string>({ value: '', disabled: true }, { nonNullable: true }),
    },
    { validators: [matchPasswordsValidator] },
  );

  constructor() {
    this.registerForm.controls.addPetNow.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.applyPetValidators(value === true));
  }

  onSubmit(): void {
    this.errorMessage = '';

    this.applyPetValidators(this.registerForm.controls.addPetNow.value === true);

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.errorMessage = 'Please fix the highlighted fields.';
      return;
    }

    const payload = this.buildRegisterPayload();

    this.isSubmitting = true;
    this.registerForm.disable(); // prevent double submit

    this.auth
      .register(payload)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.registerForm.enable();
          this.applyPetValidators(this.registerForm.controls.addPetNow.value === true);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          // ако backend връща token
          const token = res?.token;

          if (token) {
            this.auth.setToken(token);
          }

          alert('Registration successful!');
        },
      });
  }

  private applyPetValidators(addPet: boolean): void {
    const petName = this.registerForm.controls.petName;
    const petKind = this.registerForm.controls.petKind;
    const petBirthDate = this.registerForm.controls.petBirthDate;

    if (addPet) {
      petName.enable();
      petKind.enable();
      petBirthDate.enable();

      petName.setValidators([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(256),
      ]);
      petKind.setValidators([Validators.required]);
      petBirthDate.setValidators([Validators.required]);
    } else {
      petName.clearValidators();
      petKind.clearValidators();
      petBirthDate.clearValidators();

      petName.disable();
      petKind.disable();
      petBirthDate.disable();
    }

    petName.updateValueAndValidity();
    petKind.updateValueAndValidity();
    petBirthDate.updateValueAndValidity();
  }

  private buildRegisterPayload(): RegisterRequest {
    const v = this.registerForm.getRawValue();

    const payload: RegisterRequest = {
      username: v.username,
      password: v.password,
      firstName: v.firstName,
      lastName: v.lastName,
      phoneNumber: v.phoneNumber || '',
      email: v.email,
    };

    if (v.addPetNow === true) {
      payload.pet = {
        name: v.petName,
        kind: v.petKind,
        birthDate: v.petBirthDate,
      };
    }

    return payload;
  }
}

function matchPasswordsValidator(control: AbstractControl): ValidationErrors | null {
  const form = control as FormGroup;

  const password = form.get('password')?.value;
  const confirm = form.get('confirmPassword')?.value;

  if (!password || !confirm) return null;
  return password === confirm ? null : { passwordDontMatch: true };
}
