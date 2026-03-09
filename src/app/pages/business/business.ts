import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { BusinessService, BusinessProfile } from '../../services/business.service';
import { BusinessPostsService, BusinessPostResponse } from '../../services/business-posts.service';
import { ActiveProfileService } from '../../services/active-profile.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-business-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './business.html',
  styleUrl: './business.scss',
})
export class BusinessPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly businessService = inject(BusinessService);
  private readonly postsService = inject(BusinessPostsService);
  private readonly profiles = inject(ActiveProfileService);
  private readonly auth = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  business: BusinessProfile | null = null;
  posts: BusinessPostVm[] = [];

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
        this.business = null;
        this.posts = [];
        this.errorMessage = 'Missing business id.';
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
      }

      const numId = Number(id);

      if (!Number.isFinite(numId)) {
        this.business = null;
        this.posts = [];
        this.errorMessage = 'Invalid business id.';
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
      }

      this.profiles.setBusinessAsActive(numId, false);

      this.loadBusiness(numId);
      this.loadPosts(numId);
    });
  }

  private loadBusiness(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.business = null;
    this.cdr.detectChanges();

    this.businessService
      .getBusinessById(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (res) => {
          this.business = res;
          if (!res) {
            this.errorMessage = 'Business profile was not found.';
          }
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
            : 'Failed to load business profile.';
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

    this.postsService.getPostsByBusinessId(id).subscribe({
      next: (res) => {
        this.posts = (res ?? []).map((p) => this.mapPost(p));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load business posts', err);
        this.posts = [];
        this.cdr.detectChanges();
      },
    });
  }

  private mapPost(post: BusinessPostResponse): BusinessPostVm {
    return {
      title: post.title ?? '',
      body: post.body ?? '',
      businessId: post.businessId,
      userId: post.userId,
      published: post.published ?? '',
      mediaUrls: (post.mediaPaths ?? []).filter((x): x is string => !!x),
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

interface BusinessPostVm {
  title: string;
  body: string;
  businessId: number;
  userId: number;
  published: string;
  mediaUrls: string[];
}
