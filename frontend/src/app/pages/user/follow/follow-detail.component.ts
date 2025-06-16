import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { UserSummary } from '../../../models/user/user-summary.model';
import { SkeletonModule } from 'primeng/skeleton';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export enum FollowType {
    Following = 'Following',
    Followers = 'Followers',
    Default = 'Unknown'
}

@Component({
  standalone: true,
  selector: 'app-follow-detail',
  imports: [CommonModule, DialogModule, ReactiveFormsModule, TextareaModule, FormsModule, IconField, InputIcon, InputTextModule, SkeletonModule],
  templateUrl: './follow-detail.component.html'
})
export class FollowDetailComponent implements OnInit, OnChanges {
    @Input() type: FollowType = FollowType.Default;
    @Input() followers: UserSummary[] = [];
    @Input() following: UserSummary[] = [];
    @Input() display: boolean = false;
    @Output() close = new EventEmitter<void>();

    protected readonly FollowType = FollowType;

    private readonly router = inject(Router);

    protected filteredFollowers: UserSummary[] = [];
    protected filteredFollowing: UserSummary[] = [];
    protected searchTerm: string = '';
    private searchTerms = new Subject<string>();

    readonly isLoading = signal(false);
    private readonly destroyRef = inject(DestroyRef);

    ngOnInit(): void {
        this.initializeSearch();
        this.ensureFilteredUsers();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['followers'] || changes['following'] || changes['display']) {
            this.ensureFilteredUsers();
        }
    }

    private ensureFilteredUsers(): void {
        if (this.type === FollowType.Followers) {
            this.filteredFollowers = [...this.followers];
        } else if (this.type === FollowType.Following) {
            this.filteredFollowing = [...this.following];
        }
    }

    private initializeSearch(): void {
        this.searchTerms.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(term => {
            this.performSearch(term)
        });
    }

    private performSearch(term: string): void {
        this.isLoading.set(true);

        const normalizedTerm = term.toLowerCase().trim();

        if (this.type === FollowType.Following) {
            if (!normalizedTerm) {
                this.filteredFollowing = [...this.following];
                return;
            }
            this.filteredFollowing = this.following.filter(user => 
                user.userName.toLowerCase().includes(normalizedTerm)
            );
            this.isLoading.set(false);
        } else if (this.type === FollowType.Followers) {
            if (!normalizedTerm) {
                this.filteredFollowers = [...this.followers];
                return;
            }
            this.filteredFollowers = this.followers.filter(user => 
                user.userName.toLowerCase().includes(normalizedTerm)
            );
            this.isLoading.set(false);
        }
    }

    protected onSearch(): void {
        this.searchTerms.next(this.searchTerm);
    }

    protected closeModal(): void {
        this.searchTerm = '';
        this.close.emit();
    }

    protected viewUserProfile(username: string | undefined): void {
        if (!username) return;
        this.closeModal();
        this.router.navigate([`/profile/${username}`]);
    }

    protected trackByUsername(index: number, user: UserSummary): string {
        return user.userName;
    }
}
