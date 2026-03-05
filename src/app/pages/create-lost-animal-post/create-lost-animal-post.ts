import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { UserPostsService, PetType } from '../../services/user-posts.service';
import { ActiveProfileService } from '../../services/active-profile.service';

@Component({
  selector: 'app-create-lost-animal-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-lost-animal-post.html',
  styleUrl: './create-lost-animal-post.scss',
})
export class CreateLostAnimalPost {
  private readonly router = inject(Router);
  private readonly posts = inject(UserPostsService);
  private readonly profiles = inject(ActiveProfileService);

  photoFile: File | null = null;
  isSubmitting = false;
  errorMessage = '';

  form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(128)],
    }),
    type: new FormControl<PetType>('dog', { nonNullable: true, validators: [Validators.required] }),
    body: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  goHome(): void {
    this.router.navigate(['/home']);
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.photoFile = input.files?.[0] ?? null;
  }

  submit(): void {
    if (this.isSubmitting) return;

    this.errorMessage = '';

    const active = this.profiles.active();
    if (active.type !== 'user') {
      this.errorMessage = 'You must be in user profile to create this post.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Please fill all required fields.';
      return;
    }

    if (!this.photoFile) {
      this.errorMessage = 'Please choose a photo.';
      return;
    }

    const v = this.form.getRawValue();

    this.isSubmitting = true;
    this.form.disable({ emitEvent: false });

    this.posts
      .createLostAnimalPost({
        photo: this.photoFile,
        title: v.title.trim(),
        body: v.body.trim(),
        type: v.type,
      })
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.form.enable({ emitEvent: false });
        }),
      )
      .subscribe({
        next: () => this.router.navigate(['/home']),
        error: (err) => {
          const status = err?.status;
          const msg =
            err?.error?.message ||
            err?.error?.error ||
            (typeof err?.error === 'string' ? err.error : '');
          this.errorMessage = status ? `Failed (${status}) ${msg}` : 'Failed to create post.';
        },
      });
  }
}
