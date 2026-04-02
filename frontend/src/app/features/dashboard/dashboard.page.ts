import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { LocalizedDatePipe } from '../../core/i18n/localized-date.pipe';
import { ApplicationsApi } from '../applications/applications.api';
import { JOB_STATUSES, JobStatus } from '../applications/job-application.model';
import { upcomingFromApplications, UpcomingInterviewRow } from '../applications/upcoming-interviews.util';

@Component({
  selector: 'app-dashboard-page',
  imports: [LocalizedDatePipe, RouterLink, TranslocoPipe, MatButtonModule, MatCardModule],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage implements OnInit {
  private api = inject(ApplicationsApi);

  protected readonly loading = signal(true);
  protected readonly total = signal(0);
  protected readonly counts = signal<Partial<Record<JobStatus, number>>>({});
  protected statuses = JOB_STATUSES;
  protected readonly upcoming = signal<UpcomingInterviewRow[]>([]);

  ngOnInit() {
    this.load();
  }

  protected statusKpiKey(s: JobStatus): string {
    const map: Record<JobStatus, string> = {
      APPLIED: 'applied',
      SCREENING: 'screening',
      INTERVIEW: 'interview',
      OFFER: 'offer',
      REJECTED: 'rejected',
      ON_HOLD: 'onHold',
    };
    return map[s];
  }

  private load() {
    this.loading.set(true);
    const sort = ['applicationDate,desc'];
    const one = { page: 0, size: 1, sort };
    forkJoin({
      total: this.api.search(one),
      upcoming: this.api.search({ page: 0, size: 100, sort }),
      applied: this.api.search({ ...one, status: 'APPLIED' }),
      screening: this.api.search({ ...one, status: 'SCREENING' }),
      interview: this.api.search({ ...one, status: 'INTERVIEW' }),
      offer: this.api.search({ ...one, status: 'OFFER' }),
      rejected: this.api.search({ ...one, status: 'REJECTED' }),
      onHold: this.api.search({ ...one, status: 'ON_HOLD' }),
    }).subscribe({
      next: (res) => {
        this.total.set(res.total.totalElements);
        this.counts.set({
          APPLIED: res.applied.totalElements,
          SCREENING: res.screening.totalElements,
          INTERVIEW: res.interview.totalElements,
          OFFER: res.offer.totalElements,
          REJECTED: res.rejected.totalElements,
          ON_HOLD: res.onHold.totalElements,
        });
        this.upcoming.set(upcomingFromApplications(res.upcoming.content, { limit: 12 }));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
