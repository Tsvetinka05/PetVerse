import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { ShelterPostsService, AnimalType } from '../../services/shelter-posts.service';
import { ActiveProfileService } from '../../services/active-profile.service';

@Component({
  selector: 'app-create-shelter-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-shelter-post.html',
  styleUrl: './create-shelter-post.scss',
})
export class CreateShelterPost implements OnInit {
  private readonly router = inject(Router);
  private readonly service = inject(ShelterPostsService);
  private readonly profiles = inject(ActiveProfileService);

  private shelterId: number | null = null;

  photoFile: File | null = null;
  isSubmitting = false;
  errorMessage = '';

  form = new FormGroup({
    title: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(128)],
    }),
    body: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    type: new FormControl<AnimalType>('dog', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  ngOnInit(): void {
    const active = this.profiles.active();

    if (active.type !== 'shelter' || active.id == null) {
      this.errorMessage = 'You must be in a shelter profile to create a shelter post.';

      return;
    }

    this.shelterId = active.id;
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  onFileChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.photoFile = input.files?.[0] ?? null;
  }

  submit(): void {
    this.errorMessage = '';

    if (this.shelterId == null) {
      this.errorMessage = 'You must be in a shelter profile to create a post.';
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

    this.service
      .createShelterPost({
        shelterId: this.shelterId,
        title: v.title,
        body: v.body,
        type: v.type,
        photo: this.photoFile,
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => this.router.navigate(['/home']),
        error: (err) => {
          this.errorMessage =
            err?.error?.message ||
            err?.error?.error ||
            (typeof err?.error === 'string' ? err.error : '') ||
            (err?.status ? `Failed (${err.status})` : 'Failed to publish post.');
        },
      });
  }
}
