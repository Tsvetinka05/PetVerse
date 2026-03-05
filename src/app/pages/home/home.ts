import { Component, OnDestroy, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { UserPostsService, LostAnimalPostResponse } from '../../services/user-posts.service';
import { PostMediaService } from '../../services/post-media.service';

interface FeedCardVm {
  id: number;
  title: string;
  body: string;
  published: string;
  imgUrl: string | null;
  imgBroken: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  private readonly posts = inject(UserPostsService);
  private readonly media = inject(PostMediaService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly sanitizer = inject(DomSanitizer);

  loading = false;
  error = '';
  pageNumber = 1;
  hasMore = true;
  feed: FeedCardVm[] = [];

  feedHtml: SafeHtml = this.sanitizer.bypassSecurityTrustHtml('');

  private readonly cards: FeedCardVm[] = [];
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
    this.cards.length = 0;
    this.render();
    this.loadPage(this.pageNumber, true);
  }
  onImgError(item: FeedCardVm): void {
    item.imgBroken = true;
    item.imgUrl = null;
    this.cdr.detectChanges();
  }

  loadMore(): void {
    if (this.loading || !this.hasMore) return;
    this.pageNumber += 1;
    this.loadPage(this.pageNumber, false);
  }

  private loadPage(page: number, replace: boolean): void {
    this.loading = true;
    this.error = '';
    this.render();
    this.cdr.detectChanges();

    const s = this.posts.getPosts(page).subscribe({
      next: (items) => {
        const mapped = (items ?? []).map((p) => this.mapToVm(p));

        if (replace) {
          this.cards.length = 0;
          this.cards.push(...mapped);
        } else {
          this.cards.push(...mapped);
        }

        this.cards.sort(
          (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime(),
        );

        this.hasMore = !!items && items.length > 0;
        this.loading = false;

        this.render();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Feed load failed:', err);
        this.error = 'Failed to load posts.';
        this.loading = false;
        this.render();
        this.cdr.detectChanges();
      },
    });

    this.subs.add(s);
  }

  private mapToVm(p: LostAnimalPostResponse): FeedCardVm {
    const imgUrl = this.media.buildAbsolutePhotoUrl(p.photoPath);
    return {
      id: p.id,
      title: p.title ?? '',
      body: p.body ?? '',
      published: p.published ?? '',
      imgUrl,
      imgBroken: false,
    };
  }

  private escapeHtml(s: string): string {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  private render(): void {
    if (this.loading && this.cards.length === 0) {
      this.feedHtml = this.sanitizer.bypassSecurityTrustHtml(`
        <div class="empty">
          <div class="empty-title">Loading…</div>
          <div class="empty-text">Fetching posts.</div>
        </div>
      `);
      return;
    }

    if (this.error) {
      this.feedHtml = this.sanitizer.bypassSecurityTrustHtml(`
        <div class="empty">
          <div class="empty-title">Error</div>
          <div class="empty-text">${this.escapeHtml(this.error)}</div>
        </div>
      `);
      return;
    }

    if (!this.loading && !this.error && this.cards.length === 0) {
      this.feedHtml = this.sanitizer.bypassSecurityTrustHtml(`
        <div class="empty">
          <div class="empty-title">No posts yet</div>
          <div class="empty-text">When posts are added, they will show up here.</div>
        </div>
      `);
      return;
    }

    let html = '';
    for (const c of this.cards) {
      const title: string = this.escapeHtml(c.title);
      const body: string = this.escapeHtml(c.body);
      const published: string = this.escapeHtml(c.published);

      const img: string = c.imgUrl
        ? `<img class="img" src="${this.escapeHtml(c.imgUrl)}" alt="${title}" />`
        : '';

      html += `
    <article class="card">
      <h3 class="title">${title}</h3>
      <p class="body">${body}</p>
      ${img}
      <div class="meta">Published: ${published}</div>
    </article>
  `;
    }

    html += `
      <div class="more">
        <button type="button" id="loadMoreBtn" ${this.loading || !this.hasMore ? 'disabled' : ''}>
          ${this.loading ? 'Loading…' : this.hasMore ? 'Load more' : 'No more posts'}
        </button>
      </div>
    `;

    this.feedHtml = this.sanitizer.bypassSecurityTrustHtml(html);

    queueMicrotask(() => {
      const btn = document.getElementById('loadMoreBtn');
      if (!btn) return;
      btn.onclick = () => this.loadMore();
    });
  }
}
