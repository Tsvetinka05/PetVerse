import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { ShelterService, ShelterProfile } from '../../services/shelter.service';
import { ActiveProfileService } from '../../services/active-profile.service';

@Component({
  selector: 'app-shelter-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shelter.html',
  styleUrl: './shelter.scss',
})
export class ShelterPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly shelterService = inject(ShelterService);
  private readonly profiles = inject(ActiveProfileService);
  private readonly cdr = inject(ChangeDetectorRef);

  shelter: ShelterProfile | null = null;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (!id) {
        this.shelter = null;
        this.errorMessage = 'Missing shelter id.';
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
      }

      this.load(id);
    });
  }

  private load(id: string): void {
    this.shelter = null;
    this.errorMessage = '';
    this.isLoading = true;
    this.cdr.detectChanges();

    this.shelterService
      .getShelterById(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (res) => {
          this.shelter = res;
          this.cdr.detectChanges();
        },
        error: (err) => {
          const status = err?.status;
          const msg =
            err?.error?.message ||
            err?.error?.error ||
            (typeof err?.error === 'string' ? err.error : '');

          this.errorMessage = status ? `Failed (${status}) ${msg}` : `Failed ${msg}`;
          this.cdr.detectChanges();

          if (status === 401) this.router.navigate(['/login']);
        },
      });
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  switchToUser(): void {
    this.profiles.switchTo({ type: 'user', id: null }, true);
    this.router.navigate(['/me']);
  }
}
