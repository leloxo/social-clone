import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ProblemDetail } from '../../models/common/api-error.model';
import { AppError } from '../app-error.type';

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // TODO: move to errorHandler
      if (error.status === HttpStatusCode.Forbidden) {
        authService.logout();
        router.navigate(['/login']);
      }

      if (error.error && typeof error.error === 'object') {
        const problemDetail = error.error as ProblemDetail;

        return throwError(() => new AppError(
            problemDetail.detail || 'An unexpected error occurred.',
            problemDetail.status,
            problemDetail
        ));
      }

      return throwError(() => new AppError(
        error.message || 'An unexpected error occurred.',
        error.status
      ));
    })
  );
};
