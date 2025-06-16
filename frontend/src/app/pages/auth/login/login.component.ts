import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { AppDarkModeToggle } from "../../../layout/component/app.dark-mode-toggle";
import { LoginCredentials } from '../../../models/auth/login-credentials.model';
import { LoginResponse } from '../../../models/auth/login-response.model';
import { AuthService } from '../../../services/auth.service';
import { ErrorHandlingService } from '../../../services/error-handling.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    MessageModule,
    PasswordModule,
    RouterModule,
    AppDarkModeToggle
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly errorService = inject(ErrorHandlingService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(false);

  readonly loginForm = new FormGroup({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required, 
        Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,4}$")
      ]
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required, 
        Validators.minLength(8)
      ]
    })
  });

  get email() { return this.loginForm.controls.email; }
  get password() { return this.loginForm.controls.password; }

  ngOnInit(): void {
    if (localStorage.getItem('showLogoutToast') === 'true') {
      this.showSuccessToast('Logged out', 'Successfully logged out');
      localStorage.removeItem('showLogoutToast');
    }
    this.checkAuthStatus();
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    const credentials: LoginCredentials = this.loginForm.getRawValue();

    this.authService.login(credentials)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {this.handleLoginSuccess(response)},
        error: (err) => {this.handleLoginError(err, credentials)}
      });
  }

  private checkAuthStatus(): void {
    this.authService.isLoggedIn()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.authenticated) {
            this.navigateToProfile();
          }
        },
        error: (err) => {this.errorService.handleError(err)}
      });  
  }

  private handleLoginSuccess(response: LoginResponse): void {
    this.authService.saveToken(response.token);
    this.authService.saveUsername(response.username);
    this.showSuccessToast('Signed in', 'Successfully signed in');
    this.navigateToProfile();
    this.isLoading.set(false);
  }

  private handleLoginError(err: any, credentials: LoginCredentials): void {
    this.isLoading.set(false);
    this.errorService.handleError(err);
    this.loginForm.setValue({ ...credentials, password: '' });
  }

  private navigateToProfile(): void {
    this.router.navigate(['/profile/me']);
  }

  private showSuccessToast(summary: string, detail: string) {
    this.messageService.add({ severity: 'success', summary: summary, detail: detail });
  }
}
