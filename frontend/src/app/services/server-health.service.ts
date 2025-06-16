import { HttpClient, HttpStatusCode } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { catchError, map, Observable, of, throwError } from "rxjs";
import { environment } from "../environments/environment";
import { ApiResponse } from "../models/common/api-response.model";

@Injectable({
    providedIn: 'root'
})
export class ServerHealthService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;
    private readonly endpoint = 'health';

    private _serverHealth = signal<boolean | null>(null);
    public serverHealth = this._serverHealth.asReadonly();

    checkServerHealth(): Observable<boolean> {
        return this.http.get<ApiResponse>(`${this.baseUrl}/${this.endpoint}`)
            .pipe(
                map((response : ApiResponse) => {
                    const isHealthy = response.success;
                    this._serverHealth.set(isHealthy);
                    return isHealthy;
                }),
                catchError((error) => {
                    if (error.status == HttpStatusCode.Forbidden) {
                        this._serverHealth.set(true);
                        return throwError(() => error);
                    } else {
                        this._serverHealth.set(false);
                        return of(false);
                    }
                }),
            );
    }
}