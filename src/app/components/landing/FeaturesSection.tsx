import { FileText, MessageSquare, BarChart3, Users, CheckCircle2, Clock } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Proposal Management',
    description:
      'Students submit detailed project proposals with supporting documents. Track status in real time as they move through the review pipeline.',
  },
  {
    icon: MessageSquare,
    title: 'Real-Time Communication',
    description:
      'Built-in messaging between students and supervisors. Share files, discuss feedback, and keep all project conversations in one place.',
  },
  {
    icon: CheckCircle2,
    title: 'Structured Review Process',
    description:
      'Supervisors review proposals with mandatory feedback for rejections. Transparent, consistent evaluations every time.',
  },
  {
    icon: Users,
    title: 'Supervisor Matching',
    description:
      'Administrators assign supervisors based on expertise and workload. Visual capacity indicators prevent overloading.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description:
      'Administrators monitor approval rates, response times, and workload distribution across the entire department.',
  },
  {
    icon: Clock,
    title: 'Status Tracking',
    description:
      'Every proposal moves through clear stages: Pending, Approved, or Rejected. Everyone stays informed at every step.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-24 md:py-32">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-medium tracking-wide uppercase text-muted-foreground mb-3">
            Platform Features
          </p>
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-foreground text-balance">
            Everything you need to manage supervision
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-8 rounded-2xl border border-border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-center size-12 rounded-xl bg-foreground mb-6">
                <feature.icon className="size-5 text-background" />
              </div>
              <h3 className="text-lg font-medium text-card-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
