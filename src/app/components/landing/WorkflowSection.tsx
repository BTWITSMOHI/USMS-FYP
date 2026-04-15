import { FileUp, Search, CheckCircle, MessageSquare } from 'lucide-react';

const steps = [
  {
    icon: FileUp,
    number: '01',
    title: 'Submit Proposal',
    description:
      'Students create an account, fill in their project details, upload documents, and submit for review.',
  },
  {
    icon: Search,
    number: '02',
    title: 'Review & Feedback',
    description:
      'Supervisors evaluate each proposal, provide constructive feedback, and approve or request revisions.',
  },
  {
    icon: CheckCircle,
    number: '03',
    title: 'Approval & Assignment',
    description:
      'Administrators monitor the pipeline, assign supervisors where needed, and ensure balanced workloads.',
  },
  {
    icon: MessageSquare,
    number: '04',
    title: 'Collaborate & Succeed',
    description:
      'Once approved, students and supervisors communicate through built-in chat to bring the project to completion.',
  },
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="px-6 py-24 md:py-32">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-medium tracking-wide uppercase text-muted-foreground mb-3">
            The Process
          </p>
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-foreground text-balance">
            From proposal to completion in four steps
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex gap-5 p-6"
            >
              <div className="flex-shrink-0">
                <span className="block text-3xl font-medium text-accent tracking-tight select-none">
                  {step.number}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <step.icon className="size-4 text-muted-foreground" />
                  <h3 className="text-base font-medium text-foreground">{step.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
