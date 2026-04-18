'use client';

import { GraduationCap, ArrowDown } from 'lucide-react';
import Button from '@mui/material/Button';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden min-h-[92vh] flex flex-col items-center justify-center px-6 text-center bg-gradient-to-b from-white to-gray-50">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[42rem] h-[42rem] rounded-full bg-blue-100/30 blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        <div className="inline-flex items-center justify-center gap-3 mb-8 px-4 py-2 rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-900">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-medium tracking-wide uppercase text-gray-600">
            University Supervision System
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-gray-900 leading-[1.05] mb-6">
          Project supervision,
          <br className="hidden md:block" />
          streamlined from start to finish
        </h1>

        <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10">
          A centralized platform that connects students, supervisors, and
          administrators through every stage of the final-year project process.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="contained"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: '9999px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              minWidth: 160,
            }}
            onClick={onGetStarted}
          >
            Get Started
          </Button>

          <Button
            variant="outlined"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: '9999px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              minWidth: 160,
            }}
            onClick={() => {
              document.getElementById('features')?.scrollIntoView({
                behavior: 'smooth',
              });
            }}
          >
            Learn More
          </Button>
        </div>
      </div>

      <button
        onClick={() => {
          document.getElementById('features')?.scrollIntoView({
            behavior: 'smooth',
          });
        }}
        className="absolute bottom-8 animate-bounce text-gray-400 hover:text-gray-900 transition-colors"
        aria-label="Scroll down to features"
      >
        <ArrowDown className="h-5 w-5" />
      </button>
    </section>
  );
}