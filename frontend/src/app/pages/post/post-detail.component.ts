import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { Menu } from 'primeng/menu';
import { TextareaModule } from 'primeng/textarea';
import { Comment } from '../../models/post/comment.model';
import { Post } from '../../models/post/post.model';
import { AuthService } from '../../services/auth.service';
import { DateUtilsService } from '../../services/date-utils.service';
import { PostUtilsService } from '../../services/post-utils.service';
import { PostService } from '../../services/post.service';
import { ToastService } from '../../services/toast.service';

@Component({
  standalone: true,
  selector: 'app-post-detail',
  imports: [CommonModule, DialogModule, Button, ReactiveFormsModule, TextareaModule, FormsModule, Menu, ConfirmDialog],
  templateUrl: './post-detail.component.html',
  providers: [ConfirmationService]
})
export class PostDetailComponent implements OnInit {
    @Input() post?: Post;
    @Input() display: boolean = false;
    @Output() close = new EventEmitter<void>();
    @Output() postUpdated = new EventEmitter<Post>();
    @Output() postDeleted = new EventEmitter<Post>();

    private readonly postService = inject(PostService);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);
    private readonly messageService = inject(MessageService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly authService = inject(AuthService);
    private readonly postUtils = inject(PostUtilsService);
    private readonly dateUtils = inject(DateUtilsService);
    private readonly toastService = inject(ToastService);

    private readonly selectedComment = signal<Comment | undefined>(undefined);

    readonly menuItemsOwnPost: MenuItem[] = [
        {
          label: 'Options',
          items: [
            { 
              label: 'Delete Post', 
              icon: 'pi pi-trash', 
              command: () => this.confirmDeletePost()
            },
          ]
        }
    ];

    readonly menuItemsUserPost: MenuItem[] = [
        {
            label: 'Options',
            items: [
                { label: 'Report Post', icon: 'pi pi-flag', command: () => { } },
            ]
        }
    ];

    readonly menuItemsOwnComment: MenuItem[] = [
        { 
            label: 'Delete Comment', 
            icon: 'pi pi-trash', 
            command: () => this.confirmDeleteComment()
        },
    ];

    readonly menuItemsUserComment: MenuItem[] = [
        { 
            label: 'Report Comment', 
            icon: 'pi pi-flag', 
            command: () => { } 
        },
    ];

    readonly commentForm = new FormGroup({
        comment: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.maxLength(500)]
        })
    });

    ngOnInit(): void {
        this.resetForm();
    }

    onSelectComment(comment: Comment): void {
        this.selectedComment.set(comment);
    }

    private confirmDeletePost(): void {
        const post = this.post;
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
            accept: () => {
                this.deletePost(post);
            },
        });
    }

    private confirmDeleteComment(): void {
        const post = this.post;
        if (!post) return;
    
        this.confirmationService.confirm({
            message: 'Do you really want to delete this comment?',
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
            accept: () => {
                this.deleteComment(post);
            },
        });
    }

    private resetForm(): void {
        this.commentForm.patchValue({
            comment: ''
        });
    }

    onComment(): void {
        if (!this.post || this.commentForm.invalid) return;

        const formData = this.commentForm.getRawValue();

        this.postService.addComment(this.post.id, formData.comment)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response) => {
                    const currentUsername = this.authService.getUsername();     
                    // TODO: check todo ->               
                    // TODO: issue with isOwnComment? Where to set
                    
                    const updatedComments = response.postDetails.comments.map((comment: Comment) => ({
                        ...comment,
                        isOwnComment: comment.authorSummary.userName === currentUsername,
                    }));
                    
                    this.post = {
                        ...response.postDetails,
                        comments: updatedComments,
                    };

                    this.post = this.postUtils.sortCommentsByDate(this.post);                   
                    this.postUpdated.emit(this.post);
                    this.resetForm();
                },
                error: () => {
                    this.toastService.error('Failed to add comment');
                }
            });
    }

    closeModal(): void {
        this.resetForm();
        this.close.emit();
    }

    viewUserProfile(username: string | undefined): void {
        if (!username) return;
        this.closeModal();
        this.router.navigate([`/profile/${username}`]);
    }
    
    onLike(post: Post | undefined): void {
        if (!post) return;

        this.postService.isLikedByUser(post.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response) => {
                    if (response.success) {
                        this.unlikePost(post);
                    } else {
                        this.likePost(post);
                    }
                },
                error: () => {
                    this.toastService.error('Failed to check like status');
                }
            });
    }

    private likePost(post: Post): void {
        this.postService.likePost(post.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response) => {
                    if (this.post) {
                        this.post = {
                          ...this.post,
                          likeCount: response.likeCount,
                          isLiked: true
                        };
                        
                        this.postUpdated.emit(this.post);
                    }
                },
                error: () => {
                    this.toastService.error('Failed to like post');
                }
            });
    }

    private unlikePost(post: Post): void {
        this.postService.unlikePost(post.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response) => {
                    if (this.post) {
                        this.post = {
                          ...this.post,
                          likeCount: response.likeCount,
                          isLiked: false
                        };
                        
                        this.postUpdated.emit(this.post);
                    }
                },
                error: () => {
                    this.toastService.error('Failed to unlike post');
                }
            });
    }

    calculateTimeSincePosted(date: Date | undefined): string {
       return this.dateUtils.calculateTimeSincePosted(date);
    }

    private deletePost(post: Post): void {
        this.postService.removePost(post.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
                this.postDeleted.emit(post);
                this.closeModal();
                this.toastService.success('Post deleted successfully');
            },
            error: () => {
                this.toastService.error('Failed to delete post');
            }
          });
    }

    private deleteComment(post: Post): void {
        const commentId: number | undefined = this.selectedComment()?.id;
        if (!commentId) return;

        this.postService.removeComment(post.id, commentId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (response) => {
                if (this.post) {
                    this.post = {
                      ...response.postDetails
                    };
      
                    this.post = this.postUtils.sortCommentsByDate(this.post);
                    this.postUpdated.emit(this.post);
                    this.toastService.success('Comment deleted successfully');
                }
            },
            error: () => {
                this.toastService.error('Failed to delete comment');
            }
          });
    }

    get commentLength(): number {
        return this.commentForm.get('comment')?.value?.length || 0;
    }
}
