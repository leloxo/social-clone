import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServerHealthService } from '../../services/server-health.service';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-server-health',
    standalone: true,
    imports: [CommonModule, ButtonModule],
    template: `
        <div class="flex items-center justify-center h-screen">
            @if (serverHealth() === null) {
                <div class="flex-col flex items-center">
                    <p class="text-lg mb-4">Loading page...</p>
                    <i class="pi pi-spin pi-spinner " style="font-size: 4rem"></i>
                </div>
            }@else if (!serverHealth()) {
                <div class="flex-col flex items-center">
                    <p class="text-4xl font-bold mb-4">Server is down :(</p>
                    <p class="text-lg">The server is currently unavailable.</p>
                    <p class="text-lg">Reload the page to try again.</p>
                </div>
            }
        </div>
    `
})
export class ServerHealthComponent implements OnInit {
    private readonly serverHealthService = inject(ServerHealthService);
    public serverHealth = this.serverHealthService.serverHealth;

    ngOnInit(): void {

    }
}