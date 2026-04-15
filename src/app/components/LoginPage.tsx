'use client';

import { useCallback } from 'react';
import { LandingNav } from '@/app/components/landing/LandingNav';
import { HeroSection } from '@/app/components/landing/HeroSection';
import { FeaturesSection } from '@/app/components/landing/FeaturesSection';
import { RolesSection } from '@/app/components/landing/RolesSection';
import { WorkflowSection } from '@/app/components/landing/WorkflowSection';
import { AuthSection } from '@/app/components/landing/AuthSection';
import { LandingFooter } from '@/app/components/landing/LandingFooter';

export function LoginPage() {
  const scrollToAuth = useCallback(() => {
    document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-full">
      <LandingNav onGetStarted={scrollToAuth} />
      <main>
        <HeroSection onGetStarted={scrollToAuth} />
        <FeaturesSection />
        <RolesSection />
        <WorkflowSection />
        <AuthSection />
      </main>
      <LandingFooter />
    </div>
  );
}
