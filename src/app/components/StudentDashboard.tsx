'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { useSnackbar } from 'notistack';
import CircularProgress from '@mui/material/CircularProgress';
import { ProposalForm } from '@/app/components/ProposalForm';
import { ChatInterface } from '@/app/components/ChatInterface';
import {
  GraduationCap,
  LogOut,
  FileText,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  AlertCircle,
  TrendingUp,
  FolderOpen,
} from 'lucide-react';
import { Proposal } from '@/lib/types';
import { format } from 'date-fns';
import { deleteProposal, fetchProposals } from '@/lib/proposals';
import { Project, fetchProjects } from '@/lib/projects';
import { ProjectView } from '@/app/components/ProjectView';

function TabPanel({
  children,
  value,
  index,
}: {
  children: React.ReactNode;
  value: number;
  index: number;
}) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  cardClassName?: string;
  valueClassName?: string;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  cardClassName = '',
  valueClassName = 'text-gray-900',
}: StatCardProps) {
  return (
    <Card className={cardClassName}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <p className="text-sm font-medium text-gray-700">{title}</p>
          <div className="text-gray-500">{icon}</div>
        </div>

        <div className={`text-4xl font-bold mb-2 ${valueClassName}`}>{value}</div>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

export function StudentDashboard() {
  const { user, token, logout } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [showProposalForm, setShowProposalForm] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [proposalsData, projectsData] = await Promise.all([
        fetchProposals(token),
        fetchProjects(token),
      ]);
      setProposals(proposalsData.proposals);
      setProjects(projectsData.projects);
    } catch (error) {
      console.error('Failed to load data', error);
      setProposals([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProposal = async (proposalId: string | number) => {
    if (!token) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this proposal?'
    );

    if (!confirmed) return;

    try {
      await deleteProposal(token, proposalId);
      enqueueSnackbar('Proposal deleted successfully', { variant: 'success' });
      await loadData();
    } catch (error: any) {
      console.error('Delete proposal error:', error);
      enqueueSnackbar(error.message || 'Failed to delete proposal', {
        variant: 'error',
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const activeProposal = proposals.find((p) => p.status === 'approved');

  const approvedCount = useMemo(
    () => proposals.filter((p) => p.status === 'approved').length,
    [proposals]
  );

  const awaitingActionCount = useMemo(
    () => proposals.filter((p) => p.status === 'pending').length,
    [proposals]
  );

  const awaitingAdminAssignmentCount = useMemo(
    () => proposals.filter((p) => p.status === 'pending' && !p.supervisorId).length,
    [proposals]
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (
    status: string
  ): 'warning' | 'success' | 'error' | 'default' => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (proposal: Proposal) => {
    if (proposal.status === 'approved') return 'Approved';
    if (proposal.status === 'rejected') return 'Rejected';

    if (proposal.status === 'pending' && !proposal.supervisorId) {
      return 'Awaiting admin assignment';
    }

    if (proposal.status === 'pending' && proposal.supervisorId) {
      return 'Awaiting supervisor review';
    }

    return proposal.status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50">
                <GraduationCap className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Portal</h1>
                <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
              </div>
            </div>
            <Button
              variant="outlined"
              onClick={logout}
              startIcon={<LogOut className="h-4 w-4" />}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: 1 }}
        >
          <Tab
            label={
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                My Proposals
              </span>
            }
          />
          <Tab
            label={
              <span className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                My Projects ({projects.length})
              </span>
            }
          />
          {activeProposal && (
            <Tab
              label={
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Supervisor Chat
                </span>
              }
            />
          )}
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
              <StatCard
                title="Total Proposals"
                value={proposals.length}
                subtitle="All submissions"
                icon={<FileText className="h-5 w-5" />}
              />

              <StatCard
                title="Awaiting Action"
                value={awaitingActionCount}
                subtitle="Pending progress"
                icon={<Clock className="h-5 w-5 text-amber-600" />}
                cardClassName="border border-amber-300 bg-amber-50"
                valueClassName="text-amber-700"
              />

              <StatCard
                title="Approved"
                value={approvedCount}
                subtitle="Active projects"
                icon={<CheckCircle className="h-5 w-5 text-green-600" />}
                cardClassName="border border-green-300 bg-green-50"
                valueClassName="text-green-700"
              />

              <StatCard
                title="Awaiting Admin"
                value={awaitingAdminAssignmentCount}
                subtitle="Needs supervisor"
                icon={<AlertCircle className="h-5 w-5 text-red-500" />}
                cardClassName="border border-red-300 bg-red-50"
                valueClassName="text-red-600"
              />
            </div>

            {!showProposalForm && (
              <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
                <CardContent className="flex flex-col items-center justify-center py-14">
                  <Upload className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Submit a New Proposal
                  </h3>
                  <p className="text-sm text-gray-600 mb-6 text-center max-w-md">
                    Ready to start your final year project? Submit your proposal
                    and choose a preferred supervisor or select Any Supervisor.
                  </p>
                  <Button
                    variant="contained"
                    onClick={() => setShowProposalForm(true)}
                    startIcon={<FileText className="h-4 w-4" />}
                  >
                    Create Proposal
                  </Button>
                </CardContent>
              </Card>
            )}

            {showProposalForm && (
              <Card>
                <CardHeader
                  title="New Project Proposal"
                  subheader="Fill in the details below to submit your proposal"
                />
                <CardContent>
                  <ProposalForm
                    onSuccess={async () => {
                      setShowProposalForm(false);
                      setActiveTab(0);
                      await loadData();
                    }}
                    onCancel={() => setShowProposalForm(false)}
                  />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader
                title={
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-gray-700" />
                    <span className="text-2xl font-semibold">My Proposals</span>
                  </div>
                }
                subheader="Track the status of your submitted proposals"
              />
              <CardContent>
                {proposals.length === 0 ? (
                  <div className="py-14 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">You have not submitted any proposals yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {proposals.map((proposal) => (
                      <div
                        key={proposal.id}
                        className="border border-gray-200 rounded-xl p-5 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg mb-1">
                              {proposal.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {proposal.description}
                            </p>
                          </div>

                          <Chip
                            icon={getStatusIcon(proposal.status) || undefined}
                            label={getStatusLabel(proposal)}
                            color={getStatusColor(proposal.status)}
                            size="small"
                            variant="outlined"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                          <span>
                            Submitted: {format(new Date(proposal.submittedAt), 'MMM d, yyyy')}
                          </span>

                          {proposal.supervisorName ? (
                            <span>Supervisor: {proposal.supervisorName}</span>
                          ) : (
                            <span>Supervisor: Any Supervisor / Awaiting admin assignment</span>
                          )}

                          {proposal.documentName && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {proposal.documentName}
                            </span>
                          )}
                        </div>

                        {proposal.feedback && (
                          <div
                            className={`p-3 rounded-lg mb-3 ${
                              proposal.status === 'approved'
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-red-50 border border-red-200'
                            }`}
                          >
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              Feedback:
                            </p>
                            <p className="text-sm text-gray-700">{proposal.feedback}</p>
                          </div>
                        )}

                        <div className="mt-3 flex gap-3 flex-wrap">
                          {proposal.status === 'approved' && (
                            <>
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<FolderOpen className="h-4 w-4" />}
                                onClick={() => {
                                  const project = projects.find(
                                    (p) => p.proposalId === Number(proposal.id)
                                  );
                                  if (project) {
                                    setSelectedProjectId(project.id);
                                    setActiveTab(1);
                                  }
                                }}
                              >
                                View Project
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<MessageSquare className="h-4 w-4" />}
                                onClick={() => {
                                  setSelectedProposal(proposal);
                                  setActiveTab(2);
                                }}
                              >
                                Chat with Supervisor
                              </Button>
                            </>
                          )}

                          {proposal.status !== 'approved' && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleDeleteProposal(proposal.id)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {selectedProjectId ? (
            <ProjectView
              projectId={selectedProjectId}
              onBack={() => setSelectedProjectId(null)}
            />
          ) : (
            <Card>
              <CardHeader
                title={
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-gray-700" />
                    <span className="text-2xl font-semibold">My Projects</span>
                  </div>
                }
                subheader="View and manage your approved projects"
              />
              <CardContent>
                {projects.length === 0 ? (
                  <div className="py-14 text-center">
                    <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No projects yet. Projects are created when your proposals are approved.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="border border-gray-200 rounded-xl p-5 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedProjectId(project.id)}
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg mb-1">
                              {project.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {project.description}
                            </p>
                          </div>
                          <Chip
                            label={
                              project.status === 'active'
                                ? 'Active'
                                : project.status === 'completed'
                                  ? 'Completed'
                                  : 'On Hold'
                            }
                            color={
                              project.status === 'active'
                                ? 'success'
                                : project.status === 'completed'
                                  ? 'default'
                                  : 'warning'
                            }
                            size="small"
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span>Supervisor: {project.supervisorName}</span>
                          <span>
                            Created: {format(new Date(project.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {selectedProposal || activeProposal ? (
            <Card>
              <CardHeader
                title={`Chat with ${(selectedProposal || activeProposal)?.supervisorName}`}
                subheader={`Project: ${(selectedProposal || activeProposal)?.title}`}
              />
              <CardContent>
                <ChatInterface proposalId={(selectedProposal || activeProposal)!.id} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-14 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No approved proposals yet</p>
              </CardContent>
            </Card>
          )}
        </TabPanel>
      </main>
    </div>
  );
}
