import { inject, Injectable } from "@angular/core";
import { MessageService } from "primeng/api";
import { AppError } from "../core/app-error.type";

@Injectable({
    providedIn: 'root'
})
export class ErrorHandlingService {
    private readonly messageService = inject(MessageService);

    handleError(error: AppError): void {
        switch (error.status) {
            case 400:
                this.handleBadRequest(error);
                break;
            case 401:
                this.handleUnauthorized(error);
                break;
            case 403:
                this.handleForbidden(error);
                break;
            case 404:
                this.handleNotFound(error);
                break;
            case 503:
                this.handleServiceUnavailable(error);
                break;
            case 500:
                this.handleServerError(error);
                break;
            // case 0:
            //     this.showToast('error', 'Connection Error', 'Cannot connect to the server. Please check your internet connection.');
            //     break;
            default:
                this.handleGenericError();
        }
    }

    private handleBadRequest(error: AppError): void {
        const message = error.message || 'The request was invalid. Please check your input and try again.';
        this.showToast('error', 'Invalid Request', message);
    }

    private handleUnauthorized(error: AppError): void {
        const message = error.message || 'You are not authorized to access this resource. Please log in.';
        this.showToast('error', 'Unauthorized', message);
    }

    private handleForbidden(error: AppError): void {
        const message = error.message || 'You do not have permission to perform this action.';
        this.showToast('error', 'Forbidden', message);
    }

    private handleNotFound(error: AppError): void {
        const message = error.message || 'The requested resource was not found.';
        this.showToast('error', 'Not Found', message);
    }

    private handleServerError(error: AppError): void {
        const message = error.message || 'An unexpected error occurred on the server. Please try again later.';
        this.showToast('error', 'Server Error', message);
    }

    private handleServiceUnavailable(error: AppError): void {
        const message = error.message || 'The service is currently unavailable. Please try again later.';
        this.showToast('error', 'Service Unavailable', message);
    }

    private handleGenericError(error?: AppError): void {
        const message = error?.message || 'An unexpected error occurred. Please try again later.';
        this.showToast('error', 'Error', message);
    }

    private showToast(severity: string, summary: string, detail: string): void {
        this.messageService.add({ severity: severity, summary: summary, detail: detail });
    }
}