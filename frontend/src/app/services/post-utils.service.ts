import { DestroyRef, Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Post } from '../models/post/post.model';
import { Comment } from '../models/post/comment.model';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { PostService } from './post.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class PostUtilsService {
  private readonly authService = inject(AuthService);
  private readonly postService = inject(PostService);
  private readonly destroyRef = inject(DestroyRef);

  mergePostUpdates(updatedPost: Post, existingPost: Post | undefined): Post {
    if (!existingPost) return updatedPost;
    
    return {
      ...updatedPost,
      isLiked: existingPost.isLiked,
      isOwnPost: existingPost.isOwnPost,
      comments: updatedPost.comments.map(comment => ({
        ...comment,
        isOwnComment: this.isOwnComment(comment, existingPost)
      }))
    };
  }

  markOwnership(posts: Post[]): Post[] {
    const currentUsername = this.authService.getUsername();
    return posts.map(post => ({
      ...post,
      isOwnPost: post.authorSummary.userName === currentUsername,
      comments: post.comments.map(comment => ({
        ...comment,
        isOwnComment: comment.authorSummary.userName === currentUsername,
      }))
    }));
  }

  updatePostsLikeStatus(posts: Post[]): Observable<Post[]> {
    if (!posts.length) return of([]);
    
    return forkJoin(
      posts.map(post => 
        this.postService.isLikedByUser(post.id).pipe(
          catchError(() => of({ success: false })),
          map(response => ({ 
            ...post, 
            isLiked: response.success 
          }))
        )
      )
    );
  }

  toggleLike(post: Post, updateFn: (updatedPost: Post) => void): void {
    const likeAction$ = post.isLiked 
      ? this.postService.unlikePost(post.id)
      : this.postService.likePost(post.id);

    likeAction$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response) => {
        const updatedPost = {
          ...post, 
          isLiked: !post.isLiked, 
          likeCount: response.likeCount
        };
        updateFn(updatedPost);
      },
      error: (err) => console.error('Failed to update like', err) // TODO: switch to toast?
    });
  }

  sortCommentsByDate(post: Post): Post {
    if (!post.comments || post.comments.length <= 1) return post;

    return {
      ...post,
      comments: [...post.comments].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      })
    };
  }

  private isOwnComment(comment: Comment, existingPost: Post): boolean | undefined {
    const existingComment = existingPost.comments.find(c => c.id === comment.id);
    return existingComment 
      ? existingComment.isOwnComment 
      : comment.authorSummary.userName === this.authService.getUsername();
  }

}