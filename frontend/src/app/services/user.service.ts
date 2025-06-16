import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user/user.model';
import { UpdateUserDetailsRequest } from '../models/user/update-user-details-request.model';
import { environment } from '../environments/environment';
import { ApiResponse } from '../models/common/api-response.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;
    private readonly endpoint = 'users';

    fetchProfile(): Observable<User> {
        return this.http.get<User>(`${this.baseUrl}/${this.endpoint}/me`);
    }

    findUsersByUsername(userName: string): Observable<User[]> {
        return this.http.get<User[]>(`${this.baseUrl}/${this.endpoint}/search?username=${userName}`);
    }
    
    getUserByUsername(userName: string): Observable<User> {
        return this.http.get<User>(`${this.baseUrl}/${this.endpoint}/${userName}`);
    }

    existsByUsername(userName: string): Observable<ApiResponse> {
        return this.http.get<ApiResponse>(`${this.baseUrl}/${this.endpoint}/exists/${userName}`);
    }

    updateUser(userId: number, updatedUserDetails: UpdateUserDetailsRequest): Observable<User> {
        return this.http.put<User>(`${this.baseUrl}/${this.endpoint}/${userId}`, updatedUserDetails);
    }
}