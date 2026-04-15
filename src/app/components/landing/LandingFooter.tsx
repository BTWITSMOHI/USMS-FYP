import { GraduationCap } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="px-6 py-12 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-7 rounded-md bg-foreground">
              <GraduationCap className="size-3.5 text-background" />
            </div>
            <span className="text-sm font-medium text-foreground">UniSupervision</span>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Built with React, TypeScript, Tailwind CSS, and shadcn/ui. A demonstration prototype for university project supervision management.
          </p>

          <p className="text-xs text-muted-foreground">
            Version 1.0.0
          </p>
        </div>
      </div>
    </footer>
  );
}
