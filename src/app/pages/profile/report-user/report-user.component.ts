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
import { Modal } from 'bootstrap';
import { toast } from 'ngx-sonner';
import { ReportService as ReportUserService } from '../../../services/reportUser.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import {
  IReportProfileRequest,
  REPORT_REASON_OPTIONS,
  ReportReason,
} from '../../../shared/models/reportUser.interface';

const REASON_LIST = REPORT_REASON_OPTIONS;

@Component({
  selector: 'app-report-user',
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './report-user.component.html',
  styleUrl: './report-user.component.css',
})
export class ReportUserComponent implements AfterViewInit, OnDestroy {
  private reportService = inject(ReportUserService);

  @ViewChild('modalElement') modalElement?: ElementRef<HTMLDivElement>;

  userId = input.required<number>();
  userName = input.required<string>();

  reasons = REASON_LIST;
  isSubmitting = signal(false);

  reportForm = new FormGroup({
    reason: new FormControl<ReportReason | null>(null, Validators.required),
    comments: new FormControl('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(500),
    ]),
  });

  private modalInstance?: Modal;
  private onHiddenHandler = (): void => {
    this.reportForm.reset();
    this.isSubmitting.set(false);
  };

  ngAfterViewInit(): void {
    const element = this.modalElement?.nativeElement;
    if (!element) {
      return;
    }

    if (element.parentElement !== document.body) {
      document.body.appendChild(element);
    }

    this.modalInstance = Modal.getOrCreateInstance(element);
    element.addEventListener('hidden.bs.modal', this.onHiddenHandler);
  }

  ngOnDestroy(): void {
    const element = this.modalElement?.nativeElement;
    if (!element) {
      return;
    }

    element.removeEventListener('hidden.bs.modal', this.onHiddenHandler);
    if (element.parentElement === document.body) {
      document.body.removeChild(element);
    }
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

    const payload: IReportProfileRequest = {
      reason,
      comments: this.reportForm.controls.comments.value?.trim() ?? '',
    };

    this.isSubmitting.set(true);

    try {
      await this.reportService.reportProfile(this.userId(), payload);
      toast.success('Gracias, hemos recibido tu reporte sobre este perfil.');
      this.close();
    } catch (error) {
      let message = 'No se pudo enviar el reporte : ';
      if (error instanceof HttpErrorResponse) {
        message += error.error?.message || error.message || JSON.stringify(error.error) || error;
      } else {
        message += error;
      }
      toast.error(message);
      this.isSubmitting.set(false);
    }
  }
}
