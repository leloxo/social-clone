import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Menu } from 'primeng/menu';
import { SkeletonModule } from 'primeng/skeleton';
import { finalize, switchMap } from 'rxjs';
import { Post } from '../../models/post/post.model';
import { DateUtilsService } from '../../services/date-utils.service';
import { PostUtilsService } from '../../services/post-utils.service';
import { PostService } from '../../services/post.service';
import { ToastService } from '../../services/toast.service';
import { PostDetailComponent } from '../post/post-detail.component';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, PostDetailComponent, Button, Menu, ConfirmDialog, SkeletonModule],
  templateUrl: './home.component.html',
  providers: [ConfirmationService]
})
export class HomeComponent implements OnInit {
  // TODO: click to load more button, max 20 posts per page

  private readonly postService = inject(PostService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly dateUtils = inject(DateUtilsService);
  private readonly postUtils = inject(PostUtilsService);
  private readonly toastService = inject(ToastService);

  readonly posts = signal<Post[]>([]);
  readonly isDetailMode = signal(false);
  readonly selectedPost = signal<Post | undefined>(undefined);
  readonly isLoading = signal(true);

  readonly menuItemsOwnPost: MenuItem[] = [
    {
      label: 'Options',
      items: [
        { 
          label: 'Delete Post', 
          icon: 'pi pi-trash', 
          command: () => this.confirmDelete() 
        },
      ]
    }
  ];

  readonly menuItemsUser: MenuItem[] = [
    {
      label: 'Options',
      items: [
        { label: 'Report Post', icon: 'pi pi-flag', command: () => { } },
      ]
    }
  ];

  ngOnInit(): void {
    this.loadPosts();
  }

  onLike(post: Post): void {
    this.postUtils.toggleLike(post, (updatedPost) => {
      this.posts.update(posts => 
        posts.map(p => p.id === updatedPost.id ? updatedPost : p)
      );
    });
  }

  onComment(post: Post): void {
    this.isDetailMode.set(true);
    this.selectedPost.set(structuredClone(post));
  }

  onPostUpdated(updatedPost: Post): void {
    this.posts.update(posts => 
      posts.map(post => post.id === updatedPost.id 
        ? this.postUtils.mergePostUpdates(updatedPost, post) 
        : post
      )
    );

    if (this.selectedPost()?.id === updatedPost.id) {
      this.selectedPost.set(updatedPost);
    }
  }

  onPostDeleted(deletedPost: Post): void {
    this.posts.update(post => post.filter(p => p.id !== deletedPost.id));
  }

  closeDetailView(): void {
    this.isDetailMode.set(false);
  }

  viewUserProfile(username: string): void {
    if (!username) return;
    this.router.navigate([`/profile/${username}`]);
  }

  onSelectPost(post: Post): void {
    this.selectedPost.set(post);
  }

  private loadPosts(): void {
    this.isLoading.set(true);
    this.postService.getFeed()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(page => {
          const posts = this.postUtils.markOwnership(page.content);
          return this.postUtils.updatePostsLikeStatus(posts);
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (updatedPosts) => {
          this.posts.set(updatedPosts);
        },
        error: () => {
          this.toastService.error('Failed to load feed');
        }
      });
  }

  private confirmDelete(): void {
    const post = this.selectedPost();
    if (!post) return;

    this.confirmationService.confirm({
      message: 'Do you really want to delete this post?',
      header: 'Danger Zone',
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },
      accept: () => this.deletePost(post),
    });
  }

  private deletePost(post: Post): void {
    this.postService.removePost(post.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.posts.update(posts => posts.filter(p => p.id !== post.id));
          this.toastService.success('Post deleted successfully');
        },
        error: () => {
          this.toastService.error('Failed to delete post');
        }
      });
  }

  calculateTimeSincePosted(date: Date): string {
    return this.dateUtils.calculateTimeSincePosted(date);
  }
}
