import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthenticationResponse } from '../models/auth/authentication-response-model';
import { LoginCredentials } from '../models/auth/login-credentials.model';
import { LoginResponse } from '../models/auth/login-response.model';
import { RegistrationUserData } from '../models/auth/registration-credentials.model';
import { ApiResponse } from '../models/common/api-response.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;
    private readonly endpoint = 'auth';

    register(userData: RegistrationUserData): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.baseUrl}/${this.endpoint}/signup`, userData);
    }

    login(credentials: LoginCredentials): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.baseUrl}/${this.endpoint}/login`, credentials);
    }

    isLoggedIn(): Observable<AuthenticationResponse> {
        return this.http.get<AuthenticationResponse>(`${this.baseUrl}/${this.endpoint}/status`);
    }
    
    // TODO:
    logout(): Observable<any> {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        return this.http.post(`${this.baseUrl}/${this.endpoint}/logout`, {});
    }

    saveToken(token: string): void {
        localStorage.setItem('authToken', token);
    }

    getToken(): string | null {
        return localStorage.getItem('authToken');
    }

    saveUsername(username: string): void {
        localStorage.setItem('username', username);
    }

    getUsername(): string | null {
        return localStorage.getItem('username');
    }
}