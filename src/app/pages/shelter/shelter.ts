import { Component, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { ShelterService, ShelterProfile } from '../../services/shelter.service';
import { ShelterPostsService, ShelterPostResponse } from '../../services/shelter-posts.service';
import { ActiveProfileService } from '../../services/active-profile.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-shelter-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shelter.html',
  styleUrl: './shelter.scss',
})
export class ShelterPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly shelterService = inject(ShelterService);
  private readonly postsService = inject(ShelterPostsService);
  private readonly profiles = inject(ActiveProfileService);
  private readonly auth = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  shelter: ShelterProfile | null = null;
  posts: ShelterPostVm[] = [];

  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (!id) {
        this.shelter = null;
        this.posts = [];
        this.errorMessage = 'Missing shelter id.';
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
      }

      const numId = Number(id);

      if (!Number.isFinite(numId)) {
        this.shelter = null;
        this.posts = [];
        this.errorMessage = 'Invalid shelter id.';
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
      }

      this.profiles.setShelterAsActive(numId, false);
      localStorage.setItem('petverse_last_shelter_id', String(numId));

      this.loadShelter(numId);
      this.loadPosts(numId);
    });
  }

  private loadShelter(id: number): void {
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

          this.errorMessage = status
            ? `Failed (${status}) ${msg}`
            : 'Failed to load shelter profile.';
          this.cdr.detectChanges();

          if (status === 401) {
            this.router.navigate(['/login']);
          }
        },
      });
  }

  private loadPosts(id: number): void {
    this.posts = [];
    this.cdr.detectChanges();

    this.postsService.getPostsByShelterId(id).subscribe({
      next: (res) => {
        this.posts = (res ?? []).map((p) => this.mapPost(p));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load shelter posts', err);
        this.posts = [];
        this.cdr.detectChanges();
      },
    });
  }

  private mapPost(post: ShelterPostResponse): ShelterPostVm {
    return {
      title: post.title ?? '',
      body: post.body ?? '',
      type: post.type,
      status: post.status,
      published: post.published ?? '',
      photoUrl: post.photo ?? null,
    };
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  switchToUser(): void {
    this.profiles.setUserAsActive(true);
    this.router.navigate(['/me']);
  }
}

interface ShelterPostVm {
  title: string;
  body: string;
  type: 'dog' | 'cat';
  status: 'available' | 'adopted';
  published: string;
  photoUrl: string | null;
}
