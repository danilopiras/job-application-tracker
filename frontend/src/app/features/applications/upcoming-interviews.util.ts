import { InterviewDto, JobApplicationResponseDto } from './job-application.model';

export type UpcomingInterviewRow = InterviewDto & {
  companyName: string;
  title: string;
  applicationId: number;
};

export function upcomingFromApplications(
  apps: JobApplicationResponseDto[],
  opts?: { now?: Date; limit?: number },
): UpcomingInterviewRow[] {
  const now = opts?.now ?? new Date();
  const limit = opts?.limit ?? 20;
  const t = now.getTime();
  const rows: UpcomingInterviewRow[] = [];
  for (const app of apps) {
    for (const i of app.interviews ?? []) {
      const dt = new Date(i.dateTime).getTime();
      if (!Number.isNaN(dt) && dt >= t) {
        rows.push({
          ...i,
          companyName: app.companyName,
          title: app.title,
          applicationId: app.id,
        });
      }
    }
  }
  return rows
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .slice(0, limit);
}
