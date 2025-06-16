import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PanelModule } from 'primeng/panel';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { catchError, debounceTime, distinctUntilChanged, filter, of, Subject, switchMap } from 'rxjs';
import { AppDarkModeToggle } from "../../../layout/component/app.dark-mode-toggle";
import { RegistrationUserData } from '../../../models/auth/registration-credentials.model';
import { AuthService } from '../../../services/auth.service';
import { ErrorHandlingService } from '../../../services/error-handling.service';
import { UserService } from '../../../services/user.service';

enum PasswordRequirements {
  upperCase,
  lowerCase,
  number,
  specialChar,
  length
}

@Component({
  selector: 'app-register',
  imports: [
      CommonModule,
      ReactiveFormsModule,
      ButtonModule,
      InputTextModule,
      DividerModule,
      ToastModule,
      MessageModule,
      PasswordModule,
      RouterModule,
      AppDarkModeToggle,
      PanelModule,
      CheckboxModule
    ],
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly errorHandlingService = inject(ErrorHandlingService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly usernameCheck$ = new Subject<string>();
  
  protected readonly usernameExists = signal(false);
  protected readonly checkingUsername = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly PasswordRequirements = PasswordRequirements;

  readonly registrationForm = new FormGroup({
    firstName: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    lastName: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    userName: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,4}$")]
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]
    }),
    confirmPassword: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    disclaimerConfirmed: new FormControl<boolean>(false, {
      nonNullable: true,
      validators: [Validators.requiredTrue]
    }),
  });

  get firstName() { return this.registrationForm.controls.firstName; }
  get lastName() { return this.registrationForm.controls.lastName; }
  get userName() { return this.registrationForm.controls.userName; }
  get email() { return this.registrationForm.controls.email; }
  get password() { return this.registrationForm.controls.password; }
  get confirmPassword() { return this.registrationForm.controls.confirmPassword; }
  get disclaimerConfirmed() { return this.registrationForm.controls.disclaimerConfirmed; }

  ngOnInit(): void {
    this.initUsernameCheck();
  }

  onRegister(): void {
    if (this.registrationForm.invalid) {
      return;
    }

    const userData: RegistrationUserData = this.registrationForm.getRawValue();
    this.isLoading.set(true);

    // TODO: check if username is available beforehand
    this.authService.register(userData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.showSuccessToast('New account created', response.message);
          this.isLoading.set(true);
          this.router.navigate([`/login`]);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorHandlingService.handleError(err);
        }
      });
  }

  private initUsernameCheck(): void {
    this.usernameCheck$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(username => username !== ''),
      switchMap(username => {
        this.checkingUsername.set(true);
        return this.userService.existsByUsername(username).pipe(
          catchError(() => of({ success: false }))
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(response => {
      this.usernameExists.set(response.success);
      this.checkingUsername.set(false);
    });
  }

  checkUsernameAvailability(): void {
    const currentFormUsername = this.userName.value;
    this.usernameCheck$.next(currentFormUsername);
  }

  validatePasswordStrength(): { [key in PasswordRequirements]: boolean } {
    const password = this.password.value;

    return {
      [PasswordRequirements.lowerCase]: !!password?.match(/[a-z]/),
      [PasswordRequirements.upperCase]: !!password?.match(/[A-Z]/),
      [PasswordRequirements.number]: !!password?.match(/\d/),
      [PasswordRequirements.specialChar]: !!password?.match(/[@$!%*?&]/),
      [PasswordRequirements.length]: (password?.length || 0) >= 8
    };
  }

  private showSuccessToast(summary: string, detail: string) {
    this.messageService.add({ severity: 'success', summary: summary, detail: detail });
  }
}
