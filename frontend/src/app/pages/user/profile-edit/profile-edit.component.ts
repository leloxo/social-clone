import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../../models/user/user.model';

import { Button } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';

// TODO: refactor

@Component({
  standalone: true,
  selector: 'app-profile-edit',
  imports: [
    ReactiveFormsModule,
    TextareaModule,
    Button
  ],
  templateUrl: './profile-edit.component.html'
})
export class ProfileEditComponent implements OnInit {
  @Input() user?: User;
  @Input() isLoading: boolean = false;
  @Output() saveChanges = new EventEmitter<{biography: string, profileImage?: File}>();
  @Output() cancelEdit = new EventEmitter<void>();

  editForm: FormGroup;
  previewUrl: string | null = null;
  selectedFile: File | null = null;

  maxBioLength: number = 200;

  constructor(private fb: FormBuilder) {
    this.editForm = this.fb.group({
      biography: ['']
    });
  }

  ngOnInit() {
    this.editForm.patchValue({
      biography: this.user?.biography || ''
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.editForm.valid) {
      this.saveChanges.emit({
        biography: this.editForm.get('biography')?.value,
        profileImage: this.selectedFile || undefined
      });
    }
  }

  onCancel() {
    this.cancelEdit.emit();
  }

  get bioLength(): number {
    return this.editForm.get('biography')?.value?.length || 0;
  }
}
