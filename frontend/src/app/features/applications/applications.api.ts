import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { SpringPage } from '../../core/api/page.model';
import {
  InterviewDto,
  JobApplicationRequestDto,
  JobApplicationResponseDto,
  JobStatusUpdateDto,
} from './job-application.model';

export type ApplicationsSearchParams = {
  status?: string;
  companyName?: string;
  title?: string;
  applicationDateFrom?: string;
  applicationDateTo?: string;
  page?: number;
  size?: number;
  sort?: string[];
};

@Injectable({ providedIn: 'root' })
export class ApplicationsApi {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/api/applications`;

  search(params: ApplicationsSearchParams): Observable<SpringPage<JobApplicationResponseDto>> {
    let p = new HttpParams();
    if (params.status) p = p.set('status', params.status);
    if (params.companyName?.trim()) p = p.set('companyName', params.companyName.trim());
    if (params.title?.trim()) p = p.set('title', params.title.trim());
    if (params.applicationDateFrom) p = p.set('applicationDateFrom', params.applicationDateFrom);
    if (params.applicationDateTo) p = p.set('applicationDateTo', params.applicationDateTo);
    p = p.set('page', String(params.page ?? 0));
    p = p.set('size', String(params.size ?? 10));
    const sorts = params.sort?.length ? params.sort : ['applicationDate,desc'];
    for (const s of sorts) {
      p = p.append('sort', s);
    }
    return this.http.get<SpringPage<JobApplicationResponseDto>>(this.base, { params: p });
  }

  getById(id: number): Observable<JobApplicationResponseDto> {
    return this.http.get<JobApplicationResponseDto>(`${this.base}/${id}`);
  }

  create(dto: JobApplicationRequestDto): Observable<JobApplicationResponseDto> {
    return this.http.post<JobApplicationResponseDto>(this.base, dto);
  }

  update(id: number, dto: JobApplicationRequestDto): Observable<JobApplicationResponseDto> {
    return this.http.put<JobApplicationResponseDto>(`${this.base}/${id}`, dto);
  }

  updateStatus(id: number, dto: JobStatusUpdateDto): Observable<JobApplicationResponseDto> {
    return this.http.patch<JobApplicationResponseDto>(`${this.base}/${id}/status`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  addInterview(applicationId: number, dto: InterviewDto): Observable<InterviewDto> {
    return this.http.post<InterviewDto>(
      `${environment.apiBaseUrl}/api/applications/${applicationId}/interviews`,
      dto,
    );
  }

  updateInterview(id: number, dto: InterviewDto): Observable<InterviewDto> {
    return this.http.put<InterviewDto>(`${environment.apiBaseUrl}/api/interviews/${id}`, dto);
  }

  deleteInterview(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiBaseUrl}/api/interviews/${id}`);
  }
}
