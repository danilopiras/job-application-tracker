import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { LocalizedDatePipe } from '../../core/i18n/localized-date.pipe';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { ApplicationsApi } from './applications.api';
import {
  INTERVIEW_TYPES,
  InterviewDto,
  InterviewType,
  JobApplicationResponseDto,
  JobStatus,
} from './job-application.model';
import { JOB_STATUSES } from './job-application.model';

@Component({
  selector: 'app-application-detail-page',
  imports: [
    LocalizedDatePipe,
    ReactiveFormsModule,
    RouterLink,
    TranslocoPipe,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
  ],
  templateUrl: './application-detail.page.html',
  styleUrl: './application-detail.page.scss',
})
export class ApplicationDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApplicationsApi);
  private dialog = inject(MatDialog);

  protected loading = false;
  protected app: JobApplicationResponseDto | null = null;
  protected statuses = JOB_STATUSES;
  protected interviewTypes = INTERVIEW_TYPES;
  protected interviewRows: InterviewDto[] = [];
  protected interviewColumns = ['dateTime', 'type', 'interviewer', 'actions'];
  protected intSaving = false;
  protected editingId: number | null = null;

  interviewForm = new FormGroup({
    dateTime: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    type: new FormControl<InterviewType>('ONLINE', { nonNullable: true }),
    interviewer: new FormControl('', { nonNullable: true }),
    notes: new FormControl('', { nonNullable: true }),
  });

  ngOnInit() {
    this.route.paramMap.subscribe((pm) => {
      const id = Number(pm.get('id'));
      if (Number.isFinite(id)) this.load(id);
    });
  }

  private load(id: number) {
    this.loading = true;
    this.api.getById(id).subscribe({
      next: (a) => {
        this.app = a;
        this.interviewRows = [...(a.interviews ?? [])].sort(
          (x, y) => new Date(x.dateTime).getTime() - new Date(y.dateTime).getTime(),
        );
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onStatusChange(status: JobStatus) {
    if (!this.app) return;
    this.api.updateStatus(this.app.id, { status }).subscribe({
      next: (a) => {
        this.app = a;
      },
    });
  }

  deleteApp() {
    if (!this.app) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titleKey: 'applications.deleteTitle',
        messageKey: 'applications.deleteConfirm',
        confirmKey: 'applications.delete',
      },
    });
    ref.afterClosed().subscribe((ok) => {
      if (!ok || !this.app) return;
      this.api.delete(this.app.id).subscribe({
        next: () => this.router.navigateByUrl('/applications'),
      });
    });
  }

  editInterview(row: InterviewDto) {
    if (!row.id) return;
    this.editingId = row.id;
    this.interviewForm.patchValue({
      dateTime: toDatetimeLocalValue(row.dateTime),
      type: row.type,
      interviewer: row.interviewer ?? '',
      notes: row.notes ?? '',
    });
  }

  cancelInterviewEdit() {
    this.editingId = null;
    this.interviewForm.reset({
      dateTime: '',
      type: 'ONLINE',
      interviewer: '',
      notes: '',
    });
  }

  saveInterview() {
    if (!this.app || this.interviewForm.invalid) return;
    const v = this.interviewForm.getRawValue();
    const dto: InterviewDto = {
      dateTime: fromDatetimeLocalToIso(v.dateTime),
      type: v.type,
      interviewer: v.interviewer || undefined,
      notes: v.notes || undefined,
    };
    if (!dto.dateTime) return;

    this.intSaving = true;
    if (this.editingId) {
      dto.id = this.editingId;
      dto.jobApplicationId = this.app.id;
      this.api.updateInterview(this.editingId, dto).subscribe({
        next: () => {
          this.intSaving = false;
          this.cancelInterviewEdit();
          this.load(this.app!.id);
        },
        error: () => {
          this.intSaving = false;
        },
      });
    } else {
      this.api.addInterview(this.app.id, dto).subscribe({
        next: () => {
          this.intSaving = false;
          this.cancelInterviewEdit();
          this.load(this.app!.id);
        },
        error: () => {
          this.intSaving = false;
        },
      });
    }
  }

  removeInterview(row: InterviewDto) {
    if (!row.id || !this.app) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titleKey: 'interview.deleteTitle',
        messageKey: 'interview.deleteConfirm',
        confirmKey: 'interview.delete',
      },
    });
    ref.afterClosed().subscribe((ok) => {
      if (!ok || !row.id) return;
      this.api.deleteInterview(row.id!).subscribe({
        next: () => this.load(this.app!.id),
      });
    });
  }
}

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalToIso(local: string): string {
  if (!local) return '';
  const normalized = local.length === 16 ? `${local}:00` : local;
  return normalized;
}
