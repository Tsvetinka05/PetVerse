import { Component, OnDestroy, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';

import { FeedService, FeedPostDto } from '../../services/feed.service';
import { UserPostsService } from '../../services/user-posts.service';
import { AuthService } from '../../services/auth';

interface FeedCardVm {
  id: number;
  title: string;
  body: string;
  published: string;
  imgUrl: string | null;
  imgBroken: boolean;
  rawPhotoPath: string | null;
  userId: string | null;
  status: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  private readonly feedService = inject(FeedService);
  private readonly userPostsService = inject(UserPostsService);
  private readonly auth = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = false;
  error = '';
  pageNumber = 1;
  hasMore = true;
  currentUserId: string | null = null;

  feed: FeedCardVm[] = [];

  private readonly subs = new Subscription();

  ngOnInit(): void {
    this.currentUserId = this.auth.getCurrentUserId();
    this.loadFirstPage();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadFirstPage(): void {
    this.pageNumber = 1;
    this.hasMore = true;
    this.feed = [];
    this.loadPage(this.pageNumber, true);
  }

  loadMore(): void {
    if (this.loading || !this.hasMore) {
      return;
    }

    this.pageNumber += 1;
    this.loadPage(this.pageNumber, false);
  }

  onImgError(item: FeedCardVm): void {
    item.imgBroken = true;
    this.cdr.detectChanges();
  }

  isFound(item: FeedCardVm): boolean {
    return (item.status ?? '').toLowerCase() === 'found';
  }

  isOwner(item: FeedCardVm): boolean {
    if (!this.currentUserId || !item.userId) {
      return false;
    }

    return item.userId === this.currentUserId;
  }

  canMarkAsFound(item: FeedCardVm): boolean {
    return this.isOwner(item) && !this.isFound(item);
  }

  markAsFound(item: FeedCardVm): void {
    if (!this.canMarkAsFound(item)) {
      return;
    }

    const sub = this.userPostsService.markLostAnimalPostAsFound(item.id).subscribe({
      next: (updatedPost) => {
        const target = this.feed.find((x) => x.id === item.id);
        if (!target) {
          return;
        }

        target.status = updatedPost.status ?? 'found';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Mark as found failed:', err);
        this.error = 'Failed to mark post as found.';
        this.cdr.detectChanges();
      },
    });

    this.subs.add(sub);
  }

  private loadPage(page: number, replace: boolean): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    const sub = this.feedService.getFeed(page).subscribe({
      next: (items) => {
        const mapped = (items ?? []).map((p) => this.mapToVm(p));

        if (replace) {
          this.feed = mapped;
        } else {
          this.feed = [...this.feed, ...mapped];
        }

        this.feed.sort((a, b) => {
          return new Date(b.published).getTime() - new Date(a.published).getTime();
        });

        this.hasMore = !!items && items.length > 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Feed load failed:', err);
        this.error = 'Failed to load posts.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });

    this.subs.add(sub);
  }

  private mapToVm(p: FeedPostDto): FeedCardVm {
    const rawPhotoPath =
      p.photoUrl ||
      p.photoPath ||
      p.mediaUrl ||
      (p.mediaPaths && p.mediaPaths.length > 0 ? p.mediaPaths[0] : null) ||
      null;

    const imgUrl = rawPhotoPath;

    return {
      id: p.id,
      title: p.title ?? '',
      body: p.body ?? '',
      published: p.published ?? '',
      imgUrl,
      imgBroken: false,
      rawPhotoPath,
      userId: p.userId ?? null,
      status: p.status ?? '',
    };
  }
}
