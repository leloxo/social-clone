import { Component, computed, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { LayoutService } from '../service/layout.service';

@Component({
    selector: 'app-dark-mode-toggle',
    imports: [ButtonModule],
    template: `
        <div class="fixed top-8 right-8">
            <p-button 
                type="button" 
                (onClick)="toggleDarkMode()" 
                [rounded]="true" 
                [icon]="isDarkTheme() ? 'pi pi-moon' : 'pi pi-sun'" 
                severity="secondary" 
            />
        </div>
    `
})
export class AppDarkModeToggle {
    LayoutService = inject(LayoutService);

    isDarkTheme = computed(() => this.LayoutService.layoutConfig().darkTheme);

    toggleDarkMode() {
        this.LayoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }
}
