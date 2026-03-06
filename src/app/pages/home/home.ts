import { Component, OnDestroy, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';

import { FeedService, FeedPostDto } from '../../services/feed.service';

interface FeedCardVm {
  id: number;
  title: string;
  body: string;
  published: string;
  imgUrl: string | null;
  imgBroken: boolean;
  rawPhotoPath: string | null;
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  private readonly feedService = inject(FeedService);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = false;
  error = '';
  pageNumber = 1;
  hasMore = true;

  feed: FeedCardVm[] = [];

  private readonly subs = new Subscription();

  ngOnInit(): void {
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

        console.log('items from api:', items);
        console.log('mapped:', mapped);
        console.log('feed after set:', this.feed);

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

    console.log('feed dto =', p);
    console.log('rawPhotoPath =', rawPhotoPath);
    console.log('imgUrl =', imgUrl);

    return {
      id: p.id,
      title: p.title ?? '',
      body: p.body ?? '',
      published: p.published ?? '',
      imgUrl,
      imgBroken: false,
      rawPhotoPath,
    };
  }
}
