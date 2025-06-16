import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of items; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    items: MenuItem[] = [];

    ngOnInit() {
        this.items = [
            {
                items: [
                    { label: 'Home', icon: 'pi pi-fw pi-home', routerLink: ['/home'] },
                    { label: 'Search', icon: 'pi pi-fw pi-search', routerLink: ['/search'] },
                    { label: 'Create', icon: 'pi pi-fw pi-plus', routerLink: ['/upload'] },
                    { label: 'Profile', icon: 'pi pi-fw pi-user', routerLink: ['/profile/me'] }
                ]
            }
        ];
    }
}
