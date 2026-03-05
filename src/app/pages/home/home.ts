import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedService, FeedPostDto } from '../../services/feed.service';

interface FeedCard {
  id: number;
  title: string;
  body: string;
  published: string;
  photoUrl?: string;
  mediaUrl?: string;
  raw: FeedPostDto;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly feedService = inject(FeedService);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = false;
  error = '';
  pageNumber = 1;
  hasMore = true;

  feed: FeedCard[] = [];

  ngOnInit(): void {
    this.loadFirstPage();
  }

  loadFirstPage(): void {
    this.pageNumber = 1;
    this.feed = [];
    this.hasMore = true;
    this.loadPage(this.pageNumber, true);
  }

  loadMore(): void {
    if (this.loading || !this.hasMore) return;
    this.pageNumber += 1;
    this.loadPage(this.pageNumber, false);
  }

  private loadPage(page: number, replace: boolean): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.feedService.getFeed(page).subscribe({
      next: (items) => {
        const mapped = (items ?? []).map((p) => this.mapToCard(p));
        const next = replace ? mapped : [...this.feed, ...mapped];

        next.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
        this.feed = next;

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
  }

  private mapToCard(p: FeedPostDto): FeedCard {
    const photoUrl = p.photoPath ? this.toMediaUrl(p.photoPath) : undefined;
    const mediaUrl = p.mediaPaths?.length ? this.toMediaUrl(p.mediaPaths[0]) : undefined;

    return {
      id: p.id,
      title: p.title,
      body: p.body,
      published: p.published,
      photoUrl,
      mediaUrl,
      raw: p,
    };
  }

  private toMediaUrl(path: string): string {
    const backend = 'http://localhost:5224';
    if (!path) return '';

    if (path.startsWith('http')) return path;

    if (path.startsWith('/')) return backend + path;

    return `${backend}/api/uploads/${encodeURIComponent(path)}`;
  }
}
