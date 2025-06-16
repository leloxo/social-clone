import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly messageService = inject(MessageService);

  success(summary: string, detail?: string): void {
    this.messageService.add({ 
      severity: 'success', 
      summary, 
      detail: detail || summary
    });
  }

  error(summary: string, detail?: string): void {
    this.messageService.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: detail || summary
    });
  }

  info(summary: string, detail?: string): void {
    this.messageService.add({ 
      severity: 'info', 
      summary, 
      detail: detail || summary
    });
  }

  warn(summary: string, detail?: string): void {
    this.messageService.add({ 
      severity: 'warn', 
      summary: 'Warning', 
      detail: detail || summary
    });
  }
}