import { Component, OnDestroy, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { FeedService, FeedPostDto } from '../../services/feed.service';
import { UserPostsService } from '../../services/user-posts.service';
import { AuthService } from '../../services/auth';
import { AdoptionRequestsService } from '../../services/adoption-requests.service';
import { CommentsService, CommentDto, CommentType } from '../../services/comments.service';

interface FeedCommentVm {
  commentId: number;
  postId: number;
  comment: string;
  time: string;
  userId: string;
  displayUser: string;
  type: string;
}

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
  type: string;
  requestOpen: boolean;
  requestMessage: string;
  requestSent: boolean;

  commentsOpen: boolean;
  commentsLoading: boolean;
  commentsLoaded: boolean;
  commentsError: string;
  comments: FeedCommentVm[];
  newCommentText: string;
  isSubmittingComment: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  private readonly feedService = inject(FeedService);
  private readonly userPostsService = inject(UserPostsService);
  private readonly auth = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly adoptionService = inject(AdoptionRequestsService);
  private readonly commentsService = inject(CommentsService);

  loading = false;
  error = '';
  pageNumber = 1;
  hasMore = true;
  currentUserId: string | null = null;
  currentUsername: string | null = null;

  feed: FeedCardVm[] = [];

  private readonly subs = new Subscription();

  ngOnInit(): void {
    this.currentUserId = this.auth.getCurrentUserId();
    this.currentUsername = this.auth.getUsername();
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

  openRequestBox(item: FeedCardVm): void {
    item.requestOpen = !item.requestOpen;
    this.cdr.detectChanges();
  }

  sendAdoptionRequest(item: FeedCardVm): void {
    if (!item.requestMessage.trim()) {
      this.error = 'Please enter a message for the adoption request.';
      this.cdr.detectChanges();
      return;
    }

    const sub = this.adoptionService
      .createRequest({
        adoptionPostId: item.id,
        message: item.requestMessage.trim(),
      })
      .subscribe({
        next: () => {
          item.requestSent = true;
          item.requestOpen = false;
          item.requestMessage = '';
          this.error = '';
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Adoption request failed', err);
          this.error =
            err?.error?.message ||
            err?.error?.error ||
            (typeof err?.error === 'string' ? err.error : '') ||
            `Adoption request failed (${err?.status ?? 'unknown error'}).`;
          this.cdr.detectChanges();
        },
      });

    this.subs.add(sub);
  }

  private normalize(value: string | null | undefined): string {
    return (value ?? '').toLowerCase().trim();
  }

  isLostAnimalPost(item: FeedCardVm): boolean {
    const status = this.normalize(item.status);
    return status === 'notfound' || status === 'missing' || status === 'found';
  }

  isShelterAdoptionPost(item: FeedCardVm): boolean {
    const status = this.normalize(item.status);
    return status === 'available' || status === 'adopted';
  }

  isBusinessPost(item: FeedCardVm): boolean {
    return !this.isLostAnimalPost(item) && !this.isShelterAdoptionPost(item);
  }

  isFound(item: FeedCardVm): boolean {
    return this.normalize(item.status) === 'found';
  }

  isAdopted(item: FeedCardVm): boolean {
    return this.normalize(item.status) === 'adopted';
  }

  isAvailable(item: FeedCardVm): boolean {
    return this.normalize(item.status) === 'available';
  }

  isOwner(item: FeedCardVm): boolean {
    if (!this.currentUserId || !item.userId) {
      return false;
    }

    return item.userId === this.currentUserId;
  }

  canMarkAsFound(item: FeedCardVm): boolean {
    return this.isLostAnimalPost(item) && this.isOwner(item) && !this.isFound(item);
  }

  canSendAdoptionRequest(item: FeedCardVm): boolean {
    return (
      this.isShelterAdoptionPost(item) &&
      this.isAvailable(item) &&
      !!this.currentUserId &&
      !item.requestSent
    );
  }

  canComment(item: FeedCardVm): boolean {
    return !!this.currentUserId && !item.isSubmittingComment;
  }

  getCommentType(item: FeedCardVm): CommentType {
    if (this.isLostAnimalPost(item)) {
      return 'lost';
    }

    if (this.isShelterAdoptionPost(item)) {
      return 'adoption';
    }

    return 'service';
  }

  toggleComments(item: FeedCardVm): void {
    item.commentsOpen = !item.commentsOpen;

    if (item.commentsOpen && !item.commentsLoaded && !item.commentsLoading) {
      this.loadComments(item);
      return;
    }

    this.cdr.detectChanges();
  }

  loadComments(item: FeedCardVm): void {
    item.commentsLoading = true;
    item.commentsError = '';
    this.cdr.detectChanges();

    const sub = this.commentsService.getComments(item.id, this.getCommentType(item)).subscribe({
      next: (comments) => {
        item.comments = (comments ?? []).map((c) => this.mapComment(c));
        item.commentsLoaded = true;
        item.commentsLoading = false;
        item.commentsError = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Comments load failed:', err);
        item.commentsLoading = false;
        item.commentsLoaded = false;
        item.commentsError =
          err?.error?.message ||
          err?.error?.error ||
          (typeof err?.error === 'string' ? err.error : '') ||
          'Failed to load comments.';
        this.cdr.detectChanges();
      },
    });

    this.subs.add(sub);
  }

  addComment(item: FeedCardVm): void {
    const text = item.newCommentText.trim();

    if (!text) {
      item.commentsError = 'Please enter a comment.';
      this.cdr.detectChanges();
      return;
    }

    item.isSubmittingComment = true;
    item.commentsError = '';
    this.cdr.detectChanges();

    const sub = this.commentsService
      .createComment({
        postId: item.id,
        comment: text,
        type: this.getCommentType(item),
      })
      .subscribe({
        next: () => {
          item.newCommentText = '';
          item.commentsOpen = true;
          item.commentsLoaded = false;
          item.isSubmittingComment = false;
          item.commentsError = '';
          this.loadComments(item);
        },
        error: (err) => {
          console.error('Create comment failed:', err);
          item.isSubmittingComment = false;
          item.commentsError =
            err?.error?.message ||
            err?.error?.error ||
            (typeof err?.error === 'string' ? err.error : '') ||
            `Failed to add comment (${err?.status ?? 'unknown error'}).`;
          this.cdr.detectChanges();
        },
      });

    this.subs.add(sub);
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
        this.error = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Mark as found failed:', err);
        this.error =
          err?.error?.message ||
          err?.error?.error ||
          (typeof err?.error === 'string' ? err.error : '') ||
          `Failed to mark post as found (${err?.status ?? 'unknown error'}).`;
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

    return {
      id: p.id,
      title: p.title ?? '',
      body: p.body ?? '',
      published: p.published ?? '',
      imgUrl: rawPhotoPath,
      imgBroken: false,
      rawPhotoPath,
      userId: p.userId ?? null,
      status: p.status ?? '',
      type: p.type ?? '',
      requestOpen: false,
      requestMessage: '',
      requestSent: false,

      commentsOpen: false,
      commentsLoading: false,
      commentsLoaded: false,
      commentsError: '',
      comments: [],
      newCommentText: '',
      isSubmittingComment: false,
    };
  }

  private mapComment(c: CommentDto): FeedCommentVm {
    const userId = c.userId ?? '';
    const isCurrentUser = !!this.currentUserId && userId === this.currentUserId;

    return {
      commentId: c.commentId,
      postId: c.postId,
      comment: c.comment ?? '',
      time: c.time ?? '',
      userId,
      displayUser: isCurrentUser ? (this.currentUsername ?? userId) : userId,
      type: c.type ?? '',
    };
  }
}
