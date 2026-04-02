import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { LocalizedDatePipe } from '../../core/i18n/localized-date.pipe';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { ApplicationsApi } from './applications.api';
import { JOB_STATUSES, JobApplicationResponseDto } from './job-application.model';

@Component({
  selector: 'app-applications-page',
  imports: [
    LocalizedDatePipe,
    ReactiveFormsModule,
    RouterLink,
    TranslocoPipe,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './applications.page.html',
  styleUrl: './applications.page.scss',
})
export class ApplicationsPage implements OnInit {
  private api = inject(ApplicationsApi);
  private dialog = inject(MatDialog);

  protected statuses = JOB_STATUSES;
  protected readonly loading = signal(true);
  protected readonly dataSource = signal<JobApplicationResponseDto[]>([]);
  protected readonly totalElements = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly sortActive = signal('applicationDate');
  protected readonly sortDirection = signal<'asc' | 'desc' | ''>('desc');

  protected displayedColumns = [
    'companyName',
    'title',
    'status',
    'applicationDate',
    'lastUpdateDate',
    'actions',
  ];

  filters = new FormGroup({
    companyName: new FormControl('', { nonNullable: true }),
    title: new FormControl('', { nonNullable: true }),
    status: new FormControl<string>('', { nonNullable: true }),
    applicationDateFrom: new FormControl<string>('', { nonNullable: true }),
    applicationDateTo: new FormControl<string>('', { nonNullable: true }),
  });

  ngOnInit() {
    this.load();
  }

  private sortParam(): string[] {
    const active = this.sortActive();
    const dir = this.sortDirection();
    if (!active || !dir) {
      return ['applicationDate,desc'];
    }
    return [`${active},${dir}`];
  }

  private searchPayload() {
    const f = this.filters.getRawValue();
    return {
      companyName: f.companyName || undefined,
      title: f.title || undefined,
      status: f.status || undefined,
      applicationDateFrom: f.applicationDateFrom || undefined,
      applicationDateTo: f.applicationDateTo || undefined,
      page: this.pageIndex(),
      size: this.pageSize(),
      sort: this.sortParam(),
    };
  }

  load() {
    this.loading.set(true);
    this.api.search(this.searchPayload()).subscribe({
      next: (page) => {
        this.dataSource.set(page.content);
        this.totalElements.set(page.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  applyFilters() {
    this.pageIndex.set(0);
    this.load();
  }

  clearFilters() {
    this.filters.reset({
      companyName: '',
      title: '',
      status: '',
      applicationDateFrom: '',
      applicationDateTo: '',
    });
    this.pageIndex.set(0);
    this.load();
  }

  onPage(e: PageEvent) {
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
    this.load();
  }

  onSort(sort: Sort) {
    this.sortActive.set(sort.active);
    this.sortDirection.set(sort.direction as 'asc' | 'desc' | '');
    this.pageIndex.set(0);
    this.load();
  }

  deleteRow(row: JobApplicationResponseDto) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titleKey: 'applications.deleteTitle',
        messageKey: 'applications.deleteConfirm',
        confirmKey: 'applications.delete',
      },
    });
    ref.afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.api.delete(row.id).subscribe({
        next: () => this.load(),
      });
    });
  }
}
