'use client';

import { GraduationCap, ArrowDown } from 'lucide-react';
import Button from '@mui/material/Button';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-6 text-center">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-900">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-medium tracking-wide uppercase text-gray-500">
            University Supervision System
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight text-gray-900 leading-[1.1] text-balance mb-6">
          Project supervision, streamlined from start to finish
        </h1>

        <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10 text-pretty">
          A centralized platform that connects students, supervisors, and administrators
          through every stage of the final-year project process.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="contained"
            size="large"
            sx={{ px: 4, py: 1.5, borderRadius: '9999px' }}
            onClick={onGetStarted}
          >
            Get Started
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{ px: 4, py: 1.5, borderRadius: '9999px' }}
            onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Learn More
          </Button>
        </div>
      </div>

      <button
        onClick={() => {
          document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
        }}
        className="absolute bottom-8 animate-bounce text-gray-400 hover:text-gray-900 transition-colors"
        aria-label="Scroll down to features"
      >
        <ArrowDown className="h-5 w-5" />
      </button>
    </section>
  );
}
