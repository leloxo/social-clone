import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { FollowerCountRespose } from '../models/user/follower-count-response.model';
import { FollowingCountRespose } from '../models/user/following-count-response.model';
import { FollowStatusResponse } from '../models/user/follow-status-response.model';
import { ApiResponse } from '../models/common/api-response.model';
import { UserFollowingResponse } from '../models/user/user-following-response.model';
import { UserFollowersResponse } from '../models/user/user-followers-response.model';

@Injectable({
    providedIn: 'root'
})
export class UserFollowService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;
    private readonly endpoint = 'follows';

    getUserFollowersCount(userId: number): Observable<FollowerCountRespose> {
        return this.http.get<FollowerCountRespose>(`${this.baseUrl}/${this.endpoint}/followers/count/${userId}`);
    }

    getUserFollowingCount(userId: number): Observable<FollowingCountRespose> {
        return this.http.get<FollowingCountRespose>(`${this.baseUrl}/${this.endpoint}/following/count/${userId}`);
    }

    followUser(targetUserId: number): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.baseUrl}/${this.endpoint}/${targetUserId}`, {});
    }

    unfollowUser(targetUserId: number): Observable<ApiResponse> {
        return this.http.delete<ApiResponse>(`${this.baseUrl}/${this.endpoint}/${targetUserId}`);
    }

    getFollowStatus(userId: number): Observable<FollowStatusResponse> {
        return this.http.get<FollowStatusResponse>(`${this.baseUrl}/${this.endpoint}/status/${userId}`);
    }

    getUserFollowing(userId: number): Observable<UserFollowingResponse> {
        return this.http.get<UserFollowingResponse>(`${this.baseUrl}/${this.endpoint}/user/${userId}/following`); 
    }

    getUserFollowers(userId: number): Observable<UserFollowersResponse> {
        return this.http.get<UserFollowersResponse>(`${this.baseUrl}/${this.endpoint}/user/${userId}/followers`); 
    }
}