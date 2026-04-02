export type JobStatus =
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'ON_HOLD';

export type InterviewType = 'PHONE' | 'ONLINE' | 'ONSITE' | 'TECHNICAL';

export const JOB_STATUSES: JobStatus[] = [
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'ON_HOLD',
];

export const INTERVIEW_TYPES: InterviewType[] = ['PHONE', 'ONLINE', 'ONSITE', 'TECHNICAL'];

export interface JobApplicationRequestDto {
  title: string;
  companyName: string;
  source?: string;
  status: JobStatus;
  applicationDate?: string | null;
  location?: string;
  salaryExpectation?: string;
  notes?: string;
}

export interface InterviewDto {
  id?: number;
  jobApplicationId?: number;
  dateTime: string;
  type: InterviewType;
  interviewer?: string;
  notes?: string;
}

export interface JobApplicationResponseDto {
  id: number;
  title: string;
  companyName: string;
  source?: string;
  status: JobStatus;
  applicationDate?: string | null;
  lastUpdateDate?: string | null;
  location?: string;
  salaryExpectation?: string;
  notes?: string;
  interviews?: InterviewDto[];
}

export interface JobStatusUpdateDto {
  status: JobStatus;
}
