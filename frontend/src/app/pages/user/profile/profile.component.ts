import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { User } from '../../../models/user/user.model';
import { UserService } from '../../../services/user.service';

import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '../../../models/post/post.model';
import { AuthService } from '../../../services/auth.service';
import { PostService } from '../../../services/post.service';
import { UserFollowService } from '../../../services/user-follow.service';
import { ProfileEditComponent } from '../profile-edit/profile-edit.component';

import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Menu } from 'primeng/menu';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { catchError, EMPTY, finalize, forkJoin, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { AppError } from '../../../core/app-error.type';
import { UserSummary } from '../../../models/user/user-summary.model';
import { ErrorHandlingService } from '../../../services/error-handling.service';
import { PostUtilsService } from '../../../services/post-utils.service';
import { ToastService } from '../../../services/toast.service';
import { PostDetailComponent } from "../../post/post-detail.component";
import { FollowDetailComponent, FollowType } from "../follow/follow-detail.component";

interface ProfileChanges {
  biography: string,
  profileImage?: File
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AvatarModule,
    Menu,
    Button,
    CardModule,
    ProfileEditComponent,
    PostDetailComponent,
    FollowDetailComponent,
    ToastModule,
    SkeletonModule
],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  // TODO: add pagination (only loading 20 posts => one page, loading the rest when scrolling down)
  
  private readonly userService = inject(UserService);
  private readonly userFollowService = inject(UserFollowService);
  private readonly postService = inject(PostService);
  private readonly authService = inject(AuthService);
  // private readonly errorService = inject(ErrorHandlingService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly postUtils = inject(PostUtilsService);
  private readonly toastService = inject(ToastService);

  readonly user = signal<User | undefined>(undefined);
  readonly posts = signal<Post[]>([]);
  readonly isOwnProfile = signal(true);
  readonly isLoading = signal(true);
  readonly isEditMode = signal(false);
  readonly isPostDetailMode = signal(false);
  readonly isFollowDetailMode = signal(false);
  readonly isProfileUpdateLoading = signal(false);
  readonly isFollowing = signal(false);

  readonly postCount = signal(0);
  readonly followerCount = signal(0);
  readonly followingCount = signal(0);

  readonly followers = signal<UserSummary[]>([]);
  readonly following = signal<UserSummary[]>([]);
  readonly selectedPost = signal<Post | undefined>(undefined);
  readonly followType = signal<FollowType>(FollowType.Default);

  readonly menuItemsOwnProfile: MenuItem[] = [
    {
      label: 'Options',
      items: [
        { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.logout() }
      ]
    }
  ];
  
  readonly menuItemsUser: MenuItem[] = [
    {
      label: 'Options',
      items: [
        { label: 'Report User', icon: 'pi pi-flag' }
      ]
    }
  ];

  readonly FollowType = FollowType;
  private username?: string;

  ngOnInit(): void {
    this.loadProfileData();
  }

  onFollow(): void {
    const currentUser = this.user();
    if (!currentUser || this.username === 'me') return;
    
    this.userFollowService.followUser(currentUser.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(err => this.handleError('Failed to follow user', err)),
        switchMap(() => {
          this.isFollowing.set(true);
          this.followerCount.update(count => count + 1);
          
          return this.followers().length > 0 
            ? this.userService.fetchProfile().pipe(catchError(() => EMPTY))
            : of(null);
        })
      )
      .subscribe(currentUserProfile => {
        if (!currentUserProfile) return;

        this.followers.update(followers => 
          followers.some(f => f.id === currentUserProfile.id) 
            ? followers 
            : [...followers, {
              id: currentUserProfile.id,
              userName: currentUserProfile.userName,
              profileImageUrl: currentUserProfile.profileImageUrl
            }]
        );
      });
  }

  onUnfollow(): void {
    const currentUser = this.user();
    if (!currentUser || this.username === 'me') return;

    this.userFollowService.unfollowUser(currentUser.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(err => this.handleError('Failed to unfollow user', err)),
        switchMap(() => {
          this.isFollowing.set(false);
          this.followerCount.update(count => Math.max(0, count - 1));

          return this.followers().length > 0 
            ? this.userService.fetchProfile().pipe(catchError(() => EMPTY))
            : of(null);
        })
      )
      .subscribe(profile => {
        if (!profile) return;
        this.followers.update(followers => followers.filter(f => f.id !== profile.id));
      });
  }

  onSaveChanges(changes: ProfileChanges): void {
    const currentUser = this.user();
    if (!currentUser) return;

    this.isProfileUpdateLoading.set(true);

    const update$ = changes.profileImage 
      ? this.updateProfileWithImage(changes)
      : this.updateProfileWithoutImage(changes);

    update$.pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isProfileUpdateLoading.set(false))
    ).subscribe({
      next: (updatedUser) => {
        this.user.set(updatedUser);
        this.isEditMode.set(false);
        this.toastService.success('Your profile was successfully updated');
      },
      error: () => {}
    });
  }

  navigateToUpload(): void {
    this.router.navigate(["/upload"]);
  }

  showPostDetail(post: Post): void {
    this.isPostDetailMode.set(true);
    this.selectedPost.set(structuredClone(post));
  }

  closePostDetail(): void {
    this.isPostDetailMode.set(false);
  }

  showFollowDetail(type: FollowType): void {
    this.isFollowDetailMode.set(true);
    this.followType.set(type);
  }

  closeFollowDetail(): void {
    this.isFollowDetailMode.set(false);
  }

  onPostUpdated(updatedPost: Post): void {
    this.posts.update(posts => 
      posts.map(p => p.id === updatedPost.id ? this.postUtils.mergePostUpdates(updatedPost, p) : p)
    );

    if (this.selectedPost()?.id === updatedPost.id) {
      this.selectedPost.set(this.postUtils.mergePostUpdates(updatedPost, this.selectedPost()));
    }
  }

  onPostDeleted(deletedPost: Post): void {
    this.posts.update(post => post.filter(p => p.id !== deletedPost.id));
  }

  enterEditMode(): void {
    this.isEditMode.set(true);
  }
  
  exitEditMode(): void {
    this.isEditMode.set(false);
  }

  private loadProfileData(): void {
    this.route.params.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
        this.username = params['username'];
        const loggedInUsername = this.authService.getUsername();
        this.isOwnProfile.set(this.username === 'me' || this.username === loggedInUsername);
        this.fetchProfileData();
      });
  }

  private fetchProfileData(): void {
    this.isLoading.set(true);
  
    const profile$ = this.isOwnProfile()
      ? this.userService.fetchProfile()
      : this.username 
        ? this.userService.getUserByUsername(this.username) 
        : EMPTY;
  
    if (!profile$) {
      this.isLoading.set(false);
      return;
    }
  
    profile$.pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(err => {
        // TODO:
        if (err.status !== 403) {
          this.handleError('Failed to load profile', err);
        }
        return EMPTY;
      }),
      switchMap(user => {
        if (!user) return EMPTY;
  
        this.user.set(user);

        // TODO: catchError necessary?
        return forkJoin({
          stats: this.loadProfileStats().pipe(catchError(() => EMPTY)),
          posts: this.loadUserPosts().pipe(catchError(() => EMPTY)),
          followers: this.loadFollowers().pipe(catchError(() => EMPTY)),
          following: this.loadFollowing().pipe(catchError(() => EMPTY)),
          followStatus: this.isOwnProfile() ? of(undefined) : this.getFollowStatus().pipe(catchError(() => EMPTY))
        });
      }),
      finalize(() => this.isLoading.set(false))
    ).subscribe();
  }

  private loadProfileStats(): Observable<void> {
    const currentUser = this.user();
    if (!currentUser) return EMPTY;
  
    return forkJoin({
      followers: this.userFollowService.getUserFollowersCount(currentUser.id),
      following: this.userFollowService.getUserFollowingCount(currentUser.id)
    }).pipe(
      tap(({ followers, following }) => {
        this.followerCount.set(followers.followerCount);
        this.followingCount.set(following.followingCount);
      }),
      map(() => undefined),
      catchError(err => this.handleError('Failed to load stats', err))
    );
  }
  
  private loadUserPosts(): Observable<void> {
    const username = this.resolveUsername();
    if (!username) return EMPTY;
  
    return this.postService.getPostsByUser(username).pipe(
      tap(page => {
        const posts = this.postUtils.markOwnership(page.content);
        this.posts.set(posts);
        this.postCount.set(page.content.length);
      }),
      switchMap(() => this.updatePostsLikeStatus()),
      map(() => undefined),
      catchError(err => this.handleError('Failed to load posts', err))
    );
  }

  private updatePostsLikeStatus(): Observable<Post[]> {
    return this.postUtils.updatePostsLikeStatus(this.posts()).pipe(
      tap(updatedPosts => this.posts.set(updatedPosts))
    );
  }

  private loadFollowers(): Observable<void> {
    const currentUser = this.user();
    if (!currentUser) return EMPTY;
  
    return this.userFollowService.getUserFollowers(currentUser.id).pipe(
      tap(response => {
        this.followers.set(structuredClone(response.followers));
      }),
      map(() => undefined),
      catchError(err => this.handleError('Failed to load followers', err))
    );
  }
  
  private loadFollowing(): Observable<void> {
    const currentUser = this.user();
    if (!currentUser) return EMPTY;
  
    return this.userFollowService.getUserFollowing(currentUser.id).pipe(
      tap(response => {
        this.following.set(structuredClone(response.following));
      }),
      map(() => undefined),
      catchError(err => this.handleError('Failed to load following', err))
    );
  }
  
  private getFollowStatus(): Observable<void> {
    const currentUser = this.user();
    if (!currentUser || this.isOwnProfile()) return EMPTY;
  
    return this.userFollowService.getFollowStatus(currentUser.id).pipe(
      tap(response => {
        this.isFollowing.set(response.following);
      }),
      map(() => undefined),
      catchError(err => this.handleError('Failed to load follow status', err))
    );
  }

  private updateProfileWithImage(changes: ProfileChanges): Observable<User> {
    const currentUser = this.user();
    if (!currentUser || !changes.profileImage) {
      return throwError(() => new AppError('Invalid user or missing profile image', 500));
    }

    return this.postService.uploadImage(changes.profileImage).pipe(
      catchError(err => this.handleError('Failed to upload image', err)),
      switchMap(imageUrl => 
        this.userService.updateUser(currentUser.id, {
          profileImageUrl: imageUrl.toString(),
          biography: changes.biography
        }).pipe(
          catchError(err => this.handleError('Failed to update profile', err))
        )
      )
    );
  }

  private updateProfileWithoutImage(changes: ProfileChanges): Observable<User> {
    const currentUser = this.user();
    if (!currentUser) {
      return throwError(() => new AppError('Invalid user', 500));
    }
    
    return this.userService.updateUser(currentUser.id, { 
      biography: changes.biography 
    }).pipe(
      catchError(err => this.handleError('Failed to update profile', err))
    );
  }

  private resolveUsername(): string | null {
    return this.username === 'me' 
      ? this.authService.getUsername() 
      : this.username || null;
  }

  private logout(): void {
    this.authService.logout();
    localStorage.setItem('showLogoutToast', 'true');
    window.location.reload();
  }

  private handleError(message: any, error: unknown): Observable<never> {
    this.toastService.error(message);
    return EMPTY;
  }
}
