import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ServerHealthComponent } from "./pages/server-health/server-health.component";
import { ServerHealthService } from './services/server-health.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, ToastModule, CommonModule, ServerHealthComponent],
    template: `
        @if (!serverHealth()) {
            <app-server-health />
        } @else {
            <router-outlet />
        }
        <p-toast />
    `
})
export class AppComponent implements OnInit {
    private readonly serverHealthService = inject(ServerHealthService);
    private readonly destroyRef = inject(DestroyRef);

    public serverHealth = this.serverHealthService.serverHealth;

    ngOnInit(): void {
        this.serverHealthService.checkServerHealth()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe();
    }
}
