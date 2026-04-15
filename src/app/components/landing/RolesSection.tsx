import { GraduationCap, UserCircle, Shield } from 'lucide-react';

const roles = [
  {
    icon: GraduationCap,
    title: 'Students',
    tagline: 'Submit, track, and communicate',
    steps: [
      'Create and submit project proposals with detailed descriptions',
      'Upload supporting documents in PDF or Word format',
      'Choose a preferred supervisor or let the admin assign one',
      'Track proposal status through Pending, Approved, or Rejected stages',
      'Receive written feedback and revise rejected proposals',
      'Chat directly with your assigned supervisor once approved',
    ],
  },
  {
    icon: UserCircle,
    title: 'Supervisors',
    tagline: 'Review, guide, and mentor',
    steps: [
      'View all proposals assigned to you in organized tabs',
      'Download and review uploaded proposal documents',
      'Approve proposals with optional positive feedback',
      'Reject proposals with mandatory constructive feedback',
      'Communicate with students through the built-in chat',
      'Monitor your current student workload at a glance',
    ],
  },
  {
    icon: Shield,
    title: 'Administrators',
    tagline: 'Oversee, assign, and analyze',
    steps: [
      'Monitor system-wide metrics on the dashboard overview',
      'View total proposals and their status breakdown',
      'Assign supervisors to unassigned proposals',
      'Check supervisor workloads with visual capacity bars',
      'Override proposal statuses when necessary',
      'Track approval rates and average response times',
    ],
  },
];

export function RolesSection() {
  return (
    <section id="roles" className="px-6 py-24 md:py-32 bg-secondary/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-medium tracking-wide uppercase text-muted-foreground mb-3">
            How It Works
          </p>
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-foreground text-balance">
            Built for every role in the process
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {roles.map((role) => (
            <div
              key={role.title}
              className="flex flex-col bg-card rounded-2xl border border-border overflow-hidden"
            >
              <div className="p-8 pb-6">
                <div className="flex items-center gap-3 mb-1">
                  <role.icon className="size-6 text-foreground" />
                  <h3 className="text-xl font-medium text-card-foreground">{role.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{role.tagline}</p>
              </div>

              <div className="flex-1 px-8 pb-8">
                <ol className="space-y-3">
                  {role.steps.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 flex items-center justify-center size-6 rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                        {index + 1}
                      </span>
                      <span className="text-sm text-muted-foreground leading-relaxed pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
