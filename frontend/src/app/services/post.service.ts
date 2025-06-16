import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Post } from '../models/post/post.model';
import { PageResponse } from '../models/common/page-response.model';
import { environment } from '../environments/environment';
import { ApiResponse } from '../models/common/api-response.model';
import { LikeResponse } from '../models/post/like-response.model';
import { CommentResponse } from '../models/post/comment-response.model';

@Injectable({
    providedIn: 'root'
})
export class PostService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;
    private readonly endpoint = 'posts';

    uploadPost(image: File, caption: string): Observable<Post> {
        const formData = new FormData();
        formData.append('image', image);
        formData.append('caption', caption);

        return this.http.post<Post>(`${this.baseUrl}/${this.endpoint}`, formData);
    }

    // TODO: change response msg
    uploadImage(image: File): Observable<string> {
        const formData = new FormData();
        formData.append('image', image);

        return this.http.post(`${this.baseUrl}/${this.endpoint}/images`, formData, {
            responseType: 'text'
        });
    }

    getPostsByUser(username: string, page: number = 0, size: number = 20): Observable<PageResponse<Post>> {
        return this.http.get<PageResponse<Post>>(`${this.baseUrl}/${this.endpoint}/user/${username}?page=${page}&size=${size}`);
    }

    removePost(postId: number): Observable<ApiResponse> {
        return this.http.delete<ApiResponse>(`${this.baseUrl}/${this.endpoint}/${postId}`);
    }

    getFeed(page: number = 0, size: number = 20): Observable<PageResponse<Post>> {
        return this.http.get<PageResponse<Post>>(`${this.baseUrl}/${this.endpoint}/feed?page=${page}&size=${size}`);
    }

    likePost(postId: number): Observable<LikeResponse> {
        return this.http.post<LikeResponse>(`${this.baseUrl}/${this.endpoint}/${postId}/like`, {});
    }

    unlikePost(postId: number): Observable<LikeResponse> {
        return this.http.delete<LikeResponse>(`${this.baseUrl}/${this.endpoint}/${postId}/like`);
    }

    isLikedByUser(postId: number): Observable<ApiResponse> {
        return this.http.get<ApiResponse>(`${this.baseUrl}/${this.endpoint}/${postId}/status`);
    }

    addComment(postId: number, content: string): Observable<CommentResponse> {
        return this.http.post<CommentResponse>(`${this.baseUrl}/${this.endpoint}/${postId}/comment`, {content});
    }

    removeComment(postId: number, commentId: number): Observable<CommentResponse> {
        return this.http.delete<CommentResponse>(`${this.baseUrl}/${this.endpoint}/${postId}/comment/${commentId}`);
    }
}