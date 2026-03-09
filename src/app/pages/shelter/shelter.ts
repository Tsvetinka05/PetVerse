import { Component, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { ShelterService, ShelterProfile } from '../../services/shelter.service';
import {
  ShelterPostsService,
  ShelterPostResponse,
  AdoptionRequestDto,
} from '../../services/shelter-posts.service';
import { ActiveProfileService } from '../../services/active-profile.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-shelter-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
      id: post.id,
      shelterId: post.shelterId,
      title: post.title ?? '',
      body: post.body ?? '',
      type: (post.type as 'dog' | 'cat' | 'other') ?? 'dog',
      status: (post.status as 'available' | 'adopted') ?? 'available',
      published: post.published ?? '',
      adoptedAt: post.adoptedAt ?? null,
      photoUrl: post.photo ?? post.photoPath ?? null,
      requests: (post.adoptionRequestResponseDTOs ?? []).map((r: AdoptionRequestDto) => ({
        id: r.id,
        userId: r.userId ?? '',
        message: r.message ?? '',
        status: r.status ?? 'new',
      })),
      approvedUserId: '',
      isUpdating: false,
    };
  }

  isActiveShelterOwner(): boolean {
    const active = this.profiles.active();
    if (active.type !== 'shelter' || active.id == null || !this.shelter) {
      return false;
    }

    return Number(active.id) === Number(this.shelter.id);
  }

  canMarkAsAdopted(post: ShelterPostVm): boolean {
    return this.isActiveShelterOwner() && post.status !== 'adopted' && !post.isUpdating;
  }

  markAsAdoptedForUser(post: ShelterPostVm, userId: string): void {
    const normalizedUserId = (userId ?? '').trim();

    if (!normalizedUserId) {
      this.errorMessage = 'Missing user id.';
      this.cdr.detectChanges();
      return;
    }

    this.submitAdoption(post, normalizedUserId);
  }

  markAsAdoptedOutsidePlatform(post: ShelterPostVm): void {
    if (!this.canMarkAsAdopted(post)) {
      return;
    }

    this.submitAdoption(post);
  }

  private submitAdoption(post: ShelterPostVm, userId?: string): void {
    if (!this.canMarkAsAdopted(post)) {
      return;
    }

    post.isUpdating = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.postsService
      .markAsAdopted({
        adoptionPostId: post.id,
        userId,
      })
      .subscribe({
        next: (updated) => {
          post.status = (updated.status as 'available' | 'adopted') ?? 'adopted';
          post.adoptedAt = updated.adoptedAt ?? new Date().toISOString();

          if (
            updated.adoptionRequestResponseDTOs &&
            updated.adoptionRequestResponseDTOs.length > 0
          ) {
            post.requests = updated.adoptionRequestResponseDTOs.map((r: AdoptionRequestDto) => ({
              id: r.id,
              userId: r.userId ?? '',
              message: r.message ?? '',
              status: r.status ?? 'new',
            }));
            post.requests = post.requests.map((r: AdoptionRequestVm) => ({
              ...r,
              status: r.userId === userId ? 'accepted' : 'rejected',
            }));
          } else {
            post.requests = post.requests.map((r: AdoptionRequestVm) => ({
              ...r,
              status: 'rejected',
            }));
          }

          post.isUpdating = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to mark post as adopted', err);
          post.isUpdating = false;
          this.errorMessage =
            err?.error?.message ||
            err?.error?.error ||
            (typeof err?.error === 'string' ? err.error : '') ||
            'Failed to mark animal as adopted.';
          this.cdr.detectChanges();
        },
      });
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  switchToUser(): void {
    this.profiles.setUserAsActive(true);
    this.router.navigate(['/me']);
  }
}

interface AdoptionRequestVm {
  id: number;
  userId: string;
  message: string;
  status: 'new' | 'accepted' | 'rejected' | string;
}

interface ShelterPostVm {
  id: number;
  shelterId: number;
  title: string;
  body: string;
  type: 'dog' | 'cat' | 'other';
  status: 'available' | 'adopted';
  published: string;
  adoptedAt: string | null;
  photoUrl: string | null;
  requests: AdoptionRequestVm[];
  approvedUserId: string;
  isUpdating: boolean;
}
