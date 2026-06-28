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
import { ReportService } from '../../../services/report.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ICreateReportRequest, ReportReason } from '../../../shared/models/report.interface';

const REASON_LIST: { value: ReportReason; label: string }[] = [
  { value: 'fake_article', label: 'Artículo falso' },
  { value: 'scam_attempt', label: 'Fraude' },
  { value: 'suspicious_price', label: 'Precio sospechoso' },
  { value: 'spam', label: 'Spam' },
  { value: 'inappropriate_content', label: 'Contenido inapropiado' },
  { value: 'other', label: 'Otro' },
];

@Component({
  selector: 'app-report-article',
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './report-article.component.html',
  styleUrl: './report-article.component.css',
})
export class ReportArticleComponent implements AfterViewInit, OnDestroy {
  private reportService = inject(ReportService);

  @ViewChild('modalElement') modalElement?: ElementRef<HTMLDivElement>;

  articleId = input.required<number>();
  articleTitle = input.required<string>();

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

    this.modalInstance = Modal.getOrCreateInstance(element);
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

    const payload: ICreateReportRequest = {
      reason,
      comments: this.reportForm.controls.comments.value?.trim() ?? '',
      fk_articles_id: this.articleId(),
    };

    this.isSubmitting.set(true);

    try {
      await this.reportService.createReport(payload);
      toast.success('Gracias, hemos recibido tu reporte sobre este artículo.');
      this.close();
    } catch (error) {
      let message = 'No se pudo enviar el reporte : ';
      if (error instanceof HttpErrorResponse) {
        message += error.error;
      } else {
        message += error;
      }
      toast.error(message);
      this.isSubmitting.set(false);
    }
  }
}
