import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { JobCard } from './job-card';
import type { PublicJob } from '@/hooks/use-public-jobs';

interface JobListProps {
  jobs: PublicJob[];
}

export function JobList({ jobs }: JobListProps) {
  if (jobs.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-white/[0.06]">
      {jobs.map((job, index) => (
        <ScrollReveal key={job.id} delay={Math.min(index * 0.03, 0.3)}>
          <JobCard job={job} index={index} />
        </ScrollReveal>
      ))}
    </div>
  );
}
