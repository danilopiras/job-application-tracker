import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { LocalizedDatePipe } from '../../core/i18n/localized-date.pipe';
import { ApplicationsApi } from '../applications/applications.api';
import { upcomingFromApplications, UpcomingInterviewRow } from '../applications/upcoming-interviews.util';

@Component({
  selector: 'app-interviews-page',
  imports: [LocalizedDatePipe, RouterLink, TranslocoPipe, MatButtonModule, MatCardModule],
  templateUrl: './interviews.page.html',
  styleUrl: './interviews.page.scss',
})
export class InterviewsPage implements OnInit {
  private api = inject(ApplicationsApi);

  protected readonly loading = signal(true);
  protected readonly rows = signal<UpcomingInterviewRow[]>([]);

  ngOnInit() {
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.api.search({ page: 0, size: 100, sort: ['applicationDate,desc'] }).subscribe({
      next: (page) => {
        this.rows.set(upcomingFromApplications(page.content, { limit: 50 }));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
