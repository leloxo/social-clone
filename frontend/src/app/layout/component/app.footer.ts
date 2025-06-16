import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        Social Media Clone by
        <a href="https://github.com/leloxo" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">leloxo</a>
    </div>`
})
export class AppFooter {}
