import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { User } from '../../../models/user/user.model';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule,
    ReactiveFormsModule,
    InputIcon, 
    IconField, 
    InputTextModule,
  ],
  templateUrl: './search.component.html',
})
export class SearchComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private router = inject(Router);

  searchTerm: string = '';
  users: User[] = [];

  // TODO: use p-toast for error handling
  // TODO: rxjs loading ??
  isLoading = false;
  hasError = false;
  errorMessage = '';
  
  private searchTerms = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initializeSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchTerms.complete();
  }

  onSearch(): void {
    this.searchTerms.next(this.searchTerm);
  }

  viewUserProfile(username: string): void {
    if (!username) return;
    this.router.navigate([`/profile/${username}`]);
  }

  private initializeSearch(): void {
    this.searchTerms.pipe(
      debounceTime(300),

      distinctUntilChanged(),

      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.performSearch(term)
    });
  }

  private performSearch(term: string): void {
    if (!term.trim()) {
      this.users = [];
      return;
    }

    this.isLoading = true;
    this.hasError = false;

    this.userService.findUsersByUsername(this.searchTerm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users = users
          this.isLoading = false;
        },
        error: (err) => {
          this.handleError('Error fetching users', err);
        }
      });
  }

  trackByUserId(index: number, user: User): number {
    return user.id;
  }

  private handleError(message: string, error: any): void {
    this.isLoading = false;
    this.hasError = true;
    this.errorMessage = message;
    console.error(`${message}:`, error);
  }
}
