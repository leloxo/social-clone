import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { TextareaModule } from 'primeng/textarea';
import { ErrorHandlingService } from '../../services/error-handling.service';
import { PostService } from '../../services/post.service';
import { Subject, takeUntil } from 'rxjs';
import { MessageModule } from 'primeng/message';

interface UploadForm {
  caption: FormControl<string>;
}

@Component({
  selector: 'app-upload',
  imports: [
    CommonModule, 
    FormsModule,
    FileUploadModule, 
    ButtonModule, 
    TextareaModule,
    ReactiveFormsModule,
    MessageModule
  ],
  standalone: true,
  templateUrl: './upload.component.html'
})
export class UploadComponent implements OnDestroy {
  // TODO: make preview truly square, currently stretching when long image

  private readonly postService = inject(PostService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly errorHandlingService = inject(ErrorHandlingService);

  private readonly destroy$ = new Subject<void>();

  protected selectedFile = signal<File | null>(null);
  protected previewUrl = signal<string | null>(null);
  protected isLoading = signal<boolean>(false);

  protected readonly MAX_CAPTION_LENGTH = 1000;

  protected form = new FormGroup<UploadForm>({
    caption: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(this.MAX_CAPTION_LENGTH), Validators.required]
    })
  });

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onFileSelect(event: { files: File[] }): void {
    if (event.files && event.files.length > 0) {
      this.selectedFile.set(event.files[0]);
      this.createPreview(event.files[0]);
    }
  }

  protected onManualFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
      this.createPreview(input.files[0]);
    }
  }

  private createPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }
  
  protected uploadPost(): void {
    const file = this.selectedFile();
    if (!file || this.form.invalid) return;
    
    this.isLoading.set(true);
    const caption = this.form.controls.caption.value;

    this.postService.uploadPost(file, caption)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.showSuccessToast();
          this.goToProfilePage();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorHandlingService.handleError(err);
        }
    })
  }

  private goToProfilePage(): void {
    this.router.navigate([`/profile/me`]);
  }

  private showSuccessToast(): void {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Successfully uploaded new post' });
  }
}