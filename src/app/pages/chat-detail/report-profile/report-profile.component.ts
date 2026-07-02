declare const bootstrap: any;

import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { toast } from 'ngx-sonner';
import { ReportProfileService } from '../../../services/report-profile.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ICreateProfileReportRequest, ReportReason } from '../../../shared/models/report.interface';
import { getHttpErrorMessage } from '../../../shared/utils/http-error-message';

const REASON_LIST: { value: ReportReason; label: string }[] = [
  { value: 'fake_item', label: 'Artículo falso' },
  { value: 'scam_attempt', label: 'Fraude' },
  { value: 'suspicious_price', label: 'Precio sospechoso' },
  { value: 'spam', label: 'Spam' },
  { value: 'inappropriate_content', label: 'Contenido inapropiado' },
  { value: 'other', label: 'Otro' },
];

@Component({
  selector: 'app-report-profile',
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './report-profile.component.html',
  styleUrl: './report-profile.component.css',
})
export class ReportProfileComponent implements AfterViewInit, OnDestroy {
  private reportProfileService = inject(ReportProfileService);

  @ViewChild('modalElement') modalElement?: ElementRef<HTMLDivElement>;

  userId = input.required<number>();
  username = input.required<string>();

  reasons = REASON_LIST;
  isSubmitting = signal(false);

  reportForm = new FormGroup({
    reason: new FormControl<ReportReason | null>(null, Validators.required),
    comments: new FormControl('', Validators.maxLength(500)),
  });

  private modalInstance?: any;
  private onHiddenHandler = (): void => {
    this.reportForm.reset();
    this.isSubmitting.set(false);
  };

  ngAfterViewInit(): void {
    const element = this.modalElement?.nativeElement;
    if (!element) {
      return;
    }

    this.modalInstance = bootstrap.Modal.getOrCreateInstance(element);
    element.addEventListener('hidden.bs.modal', this.onHiddenHandler);
  }

  ngOnDestroy(): void {
    this.modalElement?.nativeElement.removeEventListener('hidden.bs.modal', this.onHiddenHandler);
  }

  open(): void {
    this.modalInstance?.show();
  }

  close(): void {
    this.modalInstance?.hide();
  }

  async submitReport(): Promise<void> {
    if (this.reportForm.invalid || this.isSubmitting()) {
      this.reportForm.markAllAsTouched();
      return;
    }

    const reason = this.reportForm.controls.reason.value;
    if (!reason) {
      return;
    }

    const payload: ICreateProfileReportRequest = {
      reason,
      comments: this.reportForm.controls.comments.value?.trim() ?? '',
    };

    this.isSubmitting.set(true);

    try {
      await this.reportProfileService.reportProfile(this.userId(), payload);
      toast.success('Gracias, hemos recibido tu reporte sobre este perfil.');
      this.close();
    } catch (error) {
      const fallback = 'No se pudo enviar el reporte sobre este perfil.';
      toast.error(error instanceof HttpErrorResponse ? getHttpErrorMessage(error, fallback) : fallback);
      this.isSubmitting.set(false);
    }
  }
}
