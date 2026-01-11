import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';

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
  errorMessage: string = '';
  registerForm: FormGroup;

  petKinds: string[] = ['DOG', 'CAT', 'OTHER'];

  constructor() {
    this.registerForm = new FormGroup({
      firstName: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(256),
      ]),

      lastName: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(256),
      ]),

      username: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(256),
      ]),

      phoneNumber: new FormControl(''), // optional

      email: new FormControl('', [Validators.required, Validators.email]),

      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(256),
      ]),

      confirmPassword: new FormControl('', [Validators.required]),

      addPetNow: new FormControl(false),

      petName: new FormControl({ value: '', disabled: true }),
      petKind: new FormControl({ value: '', disabled: true }),
      petBirthDate: new FormControl({ value: '', disabled: true }),
    });
    this.registerForm.controls['addPetNow'].valueChanges.subscribe((value) => {
      this.applyPetValidators(value === true);
    });
  }

  onSubmit(): void {
    this.errorMessage = '';

    const addPet = this.registerForm.value.addPetNow === true;
    this.applyPetValidators(addPet);

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.errorMessage = 'Please fix the highlighted fields.';
      return;
    }

    const password = this.registerForm.value.password;
    const confirmPassword = this.registerForm.value.confirmPassword;

    if (password !== confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    const payload = this.buildRegisterPayload();

    // Temporary (until backend is connected)
    console.log('REGISTER PAYLOAD:', payload);
    alert('Registration data is valid. Payload is printed in console.');
  }

  private applyPetValidators(addPet: boolean): void {
    const petName = this.registerForm.controls['petName'] as FormControl;
    const petKind = this.registerForm.controls['petKind'] as FormControl;
    const petBirthDate = this.registerForm.controls['petBirthDate'] as FormControl;

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

  private buildRegisterPayload(): any {
    const v = this.registerForm.value;

    const payload: any = {
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
