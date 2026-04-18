'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, Menu, X } from 'lucide-react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

interface LandingNavProps {
  onGetStarted: () => void;
}

export function LandingNav({ onGetStarted }: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#roles' },
    { label: 'Process', href: '#workflow' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-xl border-b border-gray-200 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 h-18">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-900 shadow-sm">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900 hidden sm:inline">
            UniSupervision
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="text"
            size="small"
            onClick={onGetStarted}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Log In
          </Button>

          <Button
            variant="contained"
            size="small"
            sx={{
              borderRadius: '9999px',
              px: 2.5,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
            }}
            onClick={onGetStarted}
          >
            Sign Up
          </Button>
        </div>

        <IconButton
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          sx={{ display: { md: 'none' } }}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </IconButton>
      </nav>

      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200 px-6 pb-5">
          <div className="flex flex-col gap-3 pt-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 py-1"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}

            <div className="flex gap-2 pt-3">
              <Button
                variant="outlined"
                size="small"
                fullWidth
                sx={{
                  borderRadius: '9999px',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
                onClick={() => {
                  setMobileOpen(false);
                  onGetStarted();
                }}
              >
                Log In
              </Button>

              <Button
                variant="contained"
                size="small"
                fullWidth
                sx={{
                  borderRadius: '9999px',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
                onClick={() => {
                  setMobileOpen(false);
                  onGetStarted();
                }}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}