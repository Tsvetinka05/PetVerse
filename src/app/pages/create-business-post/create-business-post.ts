import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { BusinessPostsService } from '../../services/business-posts.service';
import { ActiveProfileService } from '../../services/active-profile.service';

@Component({
  selector: 'app-create-business-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-business-post.html',
  styleUrl: './create-business-post.scss',
})
export class CreateBusinessPost {
  private readonly router = inject(Router);
  private readonly service = inject(BusinessPostsService);
  private readonly profiles = inject(ActiveProfileService);

  mediaFiles: File[] = [];
  isSubmitting = false;
  errorMessage = '';

  form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(128)],
    }),
    body: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  goHome(): void {
    this.router.navigate(['/home']);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.mediaFiles = input.files ? Array.from(input.files) : [];
  }

  submit(): void {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const active = this.profiles.active();

    if (active.type !== 'business' || active.id == null) {
      this.errorMessage = 'You must be inside a business profile.';
      return;
    }

    if (!this.mediaFiles.length) {
      this.errorMessage = 'Please select at least one photo or video.';
      return;
    }

    const v: { title: string; body: string } = this.form.getRawValue();

    this.isSubmitting = true;

    this.service
      .createBusinessPost({
        businessId: Number(active.id),
        title: v.title.trim(),
        body: v.body.trim(),
        media: this.mediaFiles,
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => this.router.navigate(['/home']),
        error: (err) => {
          const status = err?.status;
          const msg =
            err?.error?.message ||
            err?.error?.error ||
            (typeof err?.error === 'string' ? err.error : '');
          this.errorMessage = status ? `Failed (${status}) ${msg}` : 'Failed to publish post.';
        },
      });
  }
}
