'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchProposals, reviewProposal } from '@/lib/proposals';
import { fetchProjects, Project } from '@/lib/projects';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import LinearProgress from '@mui/material/LinearProgress';
import { useSnackbar } from 'notistack';
import { ChatInterface } from '@/app/components/ChatInterface';
import { ProjectView } from '@/app/components/ProjectView';
import {
  GraduationCap,
  LogOut,
  FileText,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  UserCheck,
  FolderOpen,
} from 'lucide-react';
import { Proposal } from '@/lib/types';
import { format } from 'date-fns';

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

export function SupervisorDashboard() {
  const { user, token, logout } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [activeTab, setActiveTab] = useState(0);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewingProposal, setReviewingProposal] = useState<Proposal | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [proposalData, projectData] = await Promise.all([
        fetchProposals(token),
        fetchProjects(token),
      ]);

      setProposals(proposalData.proposals);
      setProjects(projectData.projects);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
      enqueueSnackbar('Failed to load dashboard data', { variant: 'error' });
      setProposals([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const approvedProposals = useMemo(
    () => proposals.filter((p) => p.status === 'approved'),
    [proposals]
  );

  const pendingProposals = useMemo(
    () => proposals.filter((p) => p.status === 'pending'),
    [proposals]
  );

  const rejectedProposals = useMemo(
    () => proposals.filter((p) => p.status === 'rejected'),
    [proposals]
  );

  const activeProjectsCount = useMemo(
    () => projects.filter((p) => p.status === 'active').length,
    [projects]
  );

  const capacity = user?.role === 'supervisor' ? user.maxStudents || 0 : 0;
  const currentStudents =
    user?.role === 'supervisor' ? user.currentStudents || approvedProposals.length : 0;
  const capacityPercent =
    capacity > 0 ? Math.min((currentStudents / capacity) * 100, 100) : 0;

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
    if (proposal.status === 'pending') return 'Awaiting your review';
    return proposal.status;
  };

  const getProjectStatusColor = (
    status: string
  ): 'success' | 'warning' | 'default' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'on_hold':
        return 'warning';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getProjectStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'on_hold':
        return 'On Hold';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const openReviewDialog = (
    proposal: Proposal,
    status: 'approved' | 'rejected'
  ) => {
    setReviewingProposal(proposal);
    setReviewStatus(status);
    setReviewFeedback(proposal.feedback || '');
    setReviewOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewingProposal || !token) return;

    try {
      setSubmittingReview(true);

      await reviewProposal(token, reviewingProposal.id, {
        status: reviewStatus,
        feedback: reviewFeedback.trim(),
      });

      enqueueSnackbar(
        `Proposal ${reviewStatus === 'approved' ? 'approved' : 'rejected'} successfully`,
        { variant: 'success' }
      );

      setReviewOpen(false);
      setReviewFeedback('');
      setReviewingProposal(null);
      await loadData();
    } catch (error) {
      console.error('Review submit error:', error);
      enqueueSnackbar('Failed to submit review', { variant: 'error' });
    } finally {
      setSubmittingReview(false);
    }
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
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-50">
                <GraduationCap className="h-7 w-7 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Supervisor Portal
                </h1>
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
                Assigned Proposals
              </span>
            }
          />
          <Tab
            label={
              <span className="flex items-center gap-2 font-medium">
                <FolderOpen className="h-4 w-4" />
                Student Projects
                {projects.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
                    {projects.length}
                  </span>
                )}
              </span>
            }
          />
          <Tab
            label={
              <span className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Student Chat
              </span>
            }
          />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-6">
              <StatCard
                title="Total Assigned"
                value={proposals.length}
                subtitle="All assigned proposals"
                icon={<FileText className="h-5 w-5" />}
              />

              <StatCard
                title="Awaiting Review"
                value={pendingProposals.length}
                subtitle="Needs your decision"
                icon={<Clock className="h-5 w-5 text-amber-600" />}
                cardClassName="border border-amber-300 bg-amber-50"
                valueClassName="text-amber-700"
              />

              <StatCard
                title="Approved"
                value={approvedProposals.length}
                subtitle="Accepted proposals"
                icon={<CheckCircle className="h-5 w-5 text-green-600" />}
                cardClassName="border border-green-300 bg-green-50"
                valueClassName="text-green-700"
              />

              <StatCard
                title="Rejected"
                value={rejectedProposals.length}
                subtitle="Returned with feedback"
                icon={<XCircle className="h-5 w-5 text-red-500" />}
                cardClassName="border border-red-300 bg-red-50"
                valueClassName="text-red-600"
              />

              <StatCard
                title="Projects"
                value={projects.length}
                subtitle="Created from approvals"
                icon={<FolderOpen className="h-5 w-5 text-purple-600" />}
                cardClassName="border border-purple-300 bg-purple-50"
                valueClassName="text-purple-700"
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader
                  title={
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-gray-700" />
                      <span className="text-2xl font-semibold">My Capacity</span>
                    </div>
                  }
                  subheader="Current student allocation and supervision load"
                />
                <CardContent>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Current Students</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {currentStudents}/{capacity || '-'}
                        </p>
                      </div>
                      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-50">
                        <UserCheck className="h-7 w-7 text-purple-600" />
                      </div>
                    </div>

                    <LinearProgress
                      variant="determinate"
                      value={capacityPercent}
                      sx={{
                        height: 10,
                        borderRadius: 999,
                        backgroundColor: '#e5e7eb',
                      }}
                    />

                    <p className="text-sm text-gray-500">
                      You are currently supervising {currentStudents} student
                      {currentStudents === 1 ? '' : 's'} out of a maximum of {capacity || 0}.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader
                  title={
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-gray-700" />
                      <span className="text-2xl font-semibold">Overview</span>
                    </div>
                  }
                  subheader="Quick insight into your supervision activity"
                />
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-blue-50 p-5 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Pending Decisions</p>
                        <p className="text-4xl font-bold text-blue-600">
                          {pendingProposals.length}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-blue-400" />
                    </div>

                    <div className="rounded-2xl bg-green-50 p-5 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Approved Proposals</p>
                        <p className="text-4xl font-bold text-green-600">
                          {approvedProposals.length}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>

                    <div className="rounded-2xl bg-red-50 p-5 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Rejected Proposals</p>
                        <p className="text-4xl font-bold text-red-600">
                          {rejectedProposals.length}
                        </p>
                      </div>
                      <XCircle className="h-8 w-8 text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader
                title={
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-700" />
                    <span className="text-2xl font-semibold">Assigned Proposals</span>
                  </div>
                }
                subheader="Review and manage student project proposals"
              />
              <CardContent>
                {proposals.length === 0 ? (
                  <div className="py-14 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No proposals assigned yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {proposals.map((proposal) => {
                      const linkedProject = projects.find(
                        (project) => project.proposalId === proposal.id
                      );

                      return (
                        <div
                          key={proposal.id}
                          className="border border-gray-200 rounded-xl p-5 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-lg mb-1">
                                {proposal.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-1">
                                Student: {proposal.studentName}
                              </p>
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
                              Submitted:{' '}
                              {format(new Date(proposal.submittedAt), 'MMM d, yyyy')}
                            </span>
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

                          <div className="flex flex-wrap gap-3">
                            {proposal.status === 'pending' && (
                              <>
                                <Button
                                  variant="contained"
                                  color="success"
                                  onClick={() => openReviewDialog(proposal, 'approved')}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  onClick={() => openReviewDialog(proposal, 'rejected')}
                                >
                                  Reject
                                </Button>
                              </>
                            )}

                            {proposal.status === 'approved' && (
                              <Button
                                variant="outlined"
                                startIcon={<MessageSquare className="h-4 w-4" />}
                                onClick={() => {
                                  setSelectedProposal(proposal);
                                  setActiveTab(2);
                                }}
                              >
                                Open Chat
                              </Button>
                            )}

                            {proposal.status === 'approved' && linkedProject && (
                              <Button
                                variant="contained"
                                startIcon={<FolderOpen className="h-4 w-4" />}
                                onClick={() => {
                                  setSelectedProjectId(linkedProject.id);
                                  setActiveTab(1);
                                }}
                              >
                                Open Project
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
              onBack={async () => {
                setSelectedProjectId(null);
                await loadData();
              }}
            />
          ) : (
            <Card>
              <CardHeader
                title={
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-gray-700" />
                    <span className="text-2xl font-semibold">Student Projects</span>
                  </div>
                }
                subheader="Manage and review projects created from approved proposals"
              />
              <CardContent>
                {projects.length === 0 ? (
                  <div className="py-14 text-center">
                    <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No student projects available yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="border border-gray-200 rounded-xl p-5 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg mb-1">
                              {project.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-1">
                              Student: {project.studentName}
                            </p>
                            <p className="text-sm text-gray-600 line-clamp-3 mb-1">
                              {project.description}
                            </p>
                            <p className="text-sm text-gray-500">
                              Created: {format(new Date(project.createdAt), 'MMM d, yyyy')}
                            </p>
                          </div>

                          <Chip
                            label={getProjectStatusLabel(project.status)}
                            color={getProjectStatusColor(project.status)}
                            size="small"
                            variant="outlined"
                          />
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm mb-3">
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              GitHub Repository
                            </a>
                          )}
                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Live Demo
                            </a>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Button
                            variant="contained"
                            startIcon={<FolderOpen className="h-4 w-4" />}
                            onClick={() => setSelectedProjectId(project.id)}
                          >
                            Open Project
                          </Button>
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
          {selectedProposal ? (
            <Card>
              <CardHeader
                title={`Chat with ${selectedProposal.studentName}`}
                subheader={`Project: ${selectedProposal.title}`}
              />
              <CardContent>
                <ChatInterface proposalId={selectedProposal.id} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-14 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Select an approved proposal to start chatting
                </p>
              </CardContent>
            </Card>
          )}
        </TabPanel>
      </main>

      <Dialog
        open={reviewOpen}
        onClose={() => !submittingReview && setReviewOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {reviewStatus === 'approved' ? 'Approve Proposal' : 'Reject Proposal'}
        </DialogTitle>
        <DialogContent>
          <div className="pt-2">
            <TextField
              fullWidth
              multiline
              minRows={4}
              label="Feedback"
              value={reviewFeedback}
              onChange={(e) => setReviewFeedback(e.target.value)}
              placeholder="Add feedback for the student"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewOpen(false)} disabled={submittingReview}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            color={reviewStatus === 'approved' ? 'success' : 'error'}
            disabled={submittingReview}
          >
            {submittingReview
              ? 'Submitting...'
              : reviewStatus === 'approved'
                ? 'Approve'
                : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}