'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  assignSupervisor,
  fetchProposals,
  fetchSupervisors,
} from '@/lib/proposals';
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
import MenuItem from '@mui/material/MenuItem';
import LinearProgress from '@mui/material/LinearProgress';
import { useSnackbar } from 'notistack';
import {
  GraduationCap,
  LogOut,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  BarChart3,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { Proposal } from '@/lib/types';
import { format } from 'date-fns';

interface SupervisorOption {
  id: number;
  name: string;
  email: string;
  department?: string;
  expertise?: string;
  maxStudents?: number;
  currentStudents?: number;
}

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
          <div>
            <p className="text-sm font-medium text-gray-700">{title}</p>
          </div>
          <div className="text-gray-500">{icon}</div>
        </div>

        <div className={`text-4xl font-bold mb-2 ${valueClassName}`}>{value}</div>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [activeTab, setActiveTab] = useState(0);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [supervisors, setSupervisors] = useState<SupervisorOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const loadData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [proposalData, supervisorData] = await Promise.all([
        fetchProposals(token),
        fetchSupervisors(token),
      ]);

      setProposals(proposalData.proposals);
      setSupervisors(supervisorData.supervisors);
    } catch (error) {
      console.error('Failed to load admin data', error);
      enqueueSnackbar('Failed to load admin data', { variant: 'error' });
      setProposals([]);
      setSupervisors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const unassignedProposals = useMemo(
    () => proposals.filter((p) => !p.supervisorId),
    [proposals]
  );

  const assignedProposals = useMemo(
    () => proposals.filter((p) => !!p.supervisorId),
    [proposals]
  );

  const approvedProposals = useMemo(
    () => proposals.filter((p) => p.status === 'approved'),
    [proposals]
  );

  const rejectedProposals = useMemo(
    () => proposals.filter((p) => p.status === 'rejected'),
    [proposals]
  );

  const awaitingSupervisorReview = useMemo(
    () => proposals.filter((p) => p.status === 'pending' && !!p.supervisorId),
    [proposals]
  );

  const awaitingAdminAssignment = useMemo(
    () => proposals.filter((p) => p.status === 'pending' && !p.supervisorId),
    [proposals]
  );

  const approvalRate = proposals.length
    ? Math.round((approvedProposals.length / proposals.length) * 100)
    : 0;

  const averageLoad = supervisors.length
    ? (
        supervisors.reduce(
          (sum, supervisor) => sum + (supervisor.currentStudents || 0),
          0
        ) / supervisors.length
      ).toFixed(1)
    : '0';

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

  const openAssignDialog = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setSelectedSupervisorId('');
    setAssignOpen(true);
  };

  const handleAssignSupervisor = async () => {
    if (!token || !selectedProposal || !selectedSupervisorId) {
      enqueueSnackbar('Missing token, proposal, or supervisor selection', {
        variant: 'error',
      });
      return;
    }

    try {
      setAssigning(true);

      await assignSupervisor(
        token,
        selectedProposal.id,
        Number(selectedSupervisorId)
      );

      enqueueSnackbar('Supervisor assigned successfully', {
        variant: 'success',
      });

      setAssignOpen(false);
      setSelectedProposal(null);
      setSelectedSupervisorId('');
      await loadData();
    } catch (error: any) {
      console.error('Assign supervisor error:', error);
      enqueueSnackbar(error.message || 'Failed to assign supervisor', {
        variant: 'error',
      });
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-50">
                <GraduationCap className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
                <p className="text-sm text-gray-600">System Administration</p>
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
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Total Proposals"
            value={proposals.length}
            subtitle="All submissions"
            icon={<FileText className="h-5 w-5" />}
          />

          <StatCard
            title="Pending"
            value={awaitingSupervisorReview.length}
            subtitle="Awaiting review"
            icon={<Clock className="h-5 w-5 text-amber-600" />}
            cardClassName="border border-amber-300 bg-amber-50"
            valueClassName="text-amber-700"
          />

          <StatCard
            title="Approved"
            value={approvedProposals.length}
            subtitle="Active projects"
            icon={<CheckCircle className="h-5 w-5 text-green-600" />}
            cardClassName="border border-green-300 bg-green-50"
            valueClassName="text-green-700"
          />

          <StatCard
            title="Unassigned"
            value={awaitingAdminAssignment.length}
            subtitle="Need supervisor"
            icon={<AlertCircle className="h-5 w-5 text-red-500" />}
            cardClassName="border border-red-300 bg-red-50"
            valueClassName="text-red-600"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-gray-700" />
                  <span className="text-2xl font-semibold">Supervisor Workload</span>
                </div>
              }
              subheader="Current student allocation per supervisor"
            />
            <CardContent>
              {supervisors.length === 0 ? (
                <p className="text-gray-600">No supervisors found.</p>
              ) : (
                <div className="space-y-6">
                  {supervisors.map((supervisor) => {
                    const current = supervisor.currentStudents || 0;
                    const max = supervisor.maxStudents || 0;
                    const percent = max > 0 ? Math.min((current / max) * 100, 100) : 0;
                    const isFull = max > 0 && current >= max;

                    return (
                      <div key={supervisor.id}>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {supervisor.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {supervisor.expertise || 'No expertise listed'}
                            </p>
                          </div>

                          <span
                            className={`text-sm font-medium px-3 py-1 rounded-full border ${
                              isFull
                                ? 'bg-red-50 text-red-600 border-red-200'
                                : 'bg-green-50 text-green-600 border-green-200'
                            }`}
                          >
                            {current}/{max || '-'}
                          </span>
                        </div>

                        <LinearProgress
                          variant="determinate"
                          value={percent}
                          sx={{
                            height: 8,
                            borderRadius: 999,
                            backgroundColor: '#e5e7eb',
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-gray-700" />
                  <span className="text-2xl font-semibold">System Overview</span>
                </div>
              }
              subheader="Key metrics and insights"
            />
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-2xl bg-blue-50 p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Supervisors</p>
                    <p className="text-4xl font-bold text-blue-600">{supervisors.length}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-blue-400" />
                </div>

                <div className="rounded-2xl bg-purple-50 p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Workload</p>
                    <p className="text-4xl font-bold text-purple-600">{averageLoad}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-400" />
                </div>

                <div className="rounded-2xl bg-green-50 p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Approval Rate</p>
                    <p className="text-4xl font-bold text-green-600">{approvalRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ mb: 1 }}
            >
              <Tab
                label={
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    All Proposals
                  </span>
                }
              />
              <Tab
                label={
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Unassigned
                  </span>
                }
              />
            </Tabs>

            <TabPanel value={activeTab} index={0}>
              <div className="space-y-4">
                <div className="mb-3">
                  <h2 className="text-2xl font-semibold text-gray-900">All Proposals</h2>
                  <p className="text-gray-600">
                    Manage and monitor all student proposals
                  </p>
                </div>

                {proposals.length === 0 ? (
                  <div className="py-12 text-center text-gray-600">
                    No proposals found
                  </div>
                ) : (
                  proposals.map((proposal) => (
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
                          <p className="text-sm text-gray-600 mb-1">
                            Supervisor:{' '}
                            {proposal.supervisorName || 'Any Supervisor / Unassigned'}
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

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span>
                          Submitted: {format(new Date(proposal.submittedAt), 'MMM d, yyyy')}
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

                      {!proposal.supervisorId && (
                        <div className="mt-3">
                          <Button
                            variant="contained"
                            onClick={() => openAssignDialog(proposal)}
                          >
                            Assign Supervisor
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <div className="space-y-4">
                <div className="mb-3">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Unassigned Proposals
                  </h2>
                  <p className="text-gray-600">
                    Assign supervisors to proposals submitted with Any Supervisor
                  </p>
                </div>

                {unassignedProposals.length === 0 ? (
                  <div className="py-12 text-center text-gray-600">
                    No unassigned proposals
                  </div>
                ) : (
                  unassignedProposals.map((proposal) => (
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

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span>
                          Submitted: {format(new Date(proposal.submittedAt), 'MMM d, yyyy')}
                        </span>
                      </div>

                      <Button
                        variant="contained"
                        onClick={() => openAssignDialog(proposal)}
                      >
                        Assign Supervisor
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </TabPanel>
          </CardContent>
        </Card>
      </main>

      <Dialog
        open={assignOpen}
        onClose={() => !assigning && setAssignOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Assign Supervisor</DialogTitle>
        <DialogContent>
          <div className="pt-2 space-y-3">
            <TextField
              select
              fullWidth
              label="Select Supervisor"
              value={selectedSupervisorId}
              onChange={(e) => setSelectedSupervisorId(e.target.value)}
            >
              {supervisors.map((supervisor) => {
                const isFull =
                  typeof supervisor.currentStudents === 'number' &&
                  typeof supervisor.maxStudents === 'number' &&
                  supervisor.currentStudents >= supervisor.maxStudents;

                return (
                  <MenuItem
                    key={supervisor.id}
                    value={supervisor.id}
                    disabled={isFull}
                  >
                    {supervisor.name}
                    {supervisor.expertise ? ` — ${supervisor.expertise}` : ''}
                    {typeof supervisor.currentStudents === 'number' &&
                    typeof supervisor.maxStudents === 'number'
                      ? ` (${supervisor.currentStudents}/${supervisor.maxStudents})`
                      : ''}
                    {isFull ? ' — Full' : ''}
                  </MenuItem>
                );
              })}
            </TextField>

            <p className="text-sm text-gray-500">
              Supervisors who have reached their maximum student capacity are marked as{' '}
              <span className="font-medium text-red-600">Full</span> and cannot be assigned new proposals.
            </p>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)} disabled={assigning}>
            Cancel
          </Button>
          <Button
            onClick={handleAssignSupervisor}
            variant="contained"
            disabled={assigning || !selectedSupervisorId}
          >
            {assigning ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}