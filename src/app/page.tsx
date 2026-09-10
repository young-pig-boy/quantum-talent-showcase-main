import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/sections/hero-section';
import { WhyQuantumSection } from '@/components/sections/why-quantum-section';
import { JobFastLaneSection } from '@/components/sections/job-fast-lane-section';
import { PartnersSection } from '@/components/sections/partners-section';
import { JoinSection } from '@/components/sections/join-section';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <WhyQuantumSection />
      <JobFastLaneSection />
      <PartnersSection />
      <JoinSection />
      <Footer />
    </main>
  );
}
