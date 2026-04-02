import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';

import { LocalizedDatePipe } from '../../core/i18n/localized-date.pipe';
import { ApplicationsApi } from './applications.api';
import { JOB_STATUSES, JobApplicationRequestDto, JobStatus } from './job-application.model';

@Component({
  selector: 'app-application-form-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslocoPipe,
    LocalizedDatePipe,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './application-form.page.html',
  styleUrl: './application-form.page.scss',
})
export class ApplicationFormPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApplicationsApi);

  protected statuses = JOB_STATUSES;
  protected loading = false;
  protected saving = false;
  protected isEdit = false;
  protected loadedMeta: { lastUpdateDate: string | null } | null = null;
  private id: number | null = null;

  protected get backLink(): (string | number)[] {
    return this.isEdit && this.id != null ? ['/applications', this.id] : ['/applications'];
  }

  form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(200)] }),
    companyName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(200)] }),
    source: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(100)] }),
    status: new FormControl<JobStatus>('APPLIED', { nonNullable: true, validators: [Validators.required] }),
    applicationDate: new FormControl<string>('', { nonNullable: true }),
    location: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(200)] }),
    salaryExpectation: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(100)] }),
    notes: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(2000)] }),
  });

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.id = Number(idParam);
      this.load();
    }
  }

  private load() {
    if (this.id == null) return;
    this.loading = true;
    this.api.getById(this.id).subscribe({
      next: (a) => {
        this.loadedMeta = { lastUpdateDate: a.lastUpdateDate ?? null };
        this.form.patchValue({
          title: a.title,
          companyName: a.companyName,
          source: a.source ?? '',
          status: a.status,
          applicationDate: a.applicationDate ?? '',
          location: a.location ?? '',
          salaryExpectation: a.salaryExpectation ?? '',
          notes: a.notes ?? '',
        });
        this.form.markAsPristine();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  private toRequest(): JobApplicationRequestDto {
    const v = this.form.getRawValue();
    return {
      title: v.title,
      companyName: v.companyName,
      source: v.source || undefined,
      status: v.status,
      applicationDate: v.applicationDate || undefined,
      location: v.location || undefined,
      salaryExpectation: v.salaryExpectation || undefined,
      notes: v.notes || undefined,
    };
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    const dto = this.toRequest();
    if (this.isEdit && this.id != null) {
      this.api.update(this.id, dto).subscribe({
        next: (a) => {
          this.saving = false;
          this.router.navigateByUrl(`/applications/${a.id}`);
        },
        error: () => {
          this.saving = false;
        },
      });
    } else {
      this.api.create(dto).subscribe({
        next: (a) => {
          this.saving = false;
          this.router.navigateByUrl(`/applications/${a.id}`);
        },
        error: () => {
          this.saving = false;
        },
      });
    }
  }
}
