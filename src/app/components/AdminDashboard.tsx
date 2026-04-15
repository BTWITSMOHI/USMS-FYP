import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import LinearProgress from '@mui/material/LinearProgress';
import { 
  Shield, 
  LogOut, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { Proposal } from '@/lib/types';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const { proposals, supervisors, updateProposal } = useData();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [assignDialog, setAssignDialog] = useState(false);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState('');

  const pendingProposals = proposals.filter(p => p.status === 'pending');
  const approvedProposals = proposals.filter(p => p.status === 'approved');
  const rejectedProposals = proposals.filter(p => p.status === 'rejected');
  const unassignedProposals = proposals.filter(p => !p.supervisorId);

  const handleAssignSupervisor = () => {
    if (!selectedProposal || !selectedSupervisorId) return;

    const supervisor = supervisors.find(s => s.id === selectedSupervisorId);
    if (!supervisor) return;

    updateProposal(selectedProposal.id, {
      supervisorId: selectedSupervisorId,
      supervisorName: supervisor.name,
    });

    enqueueSnackbar(`Assigned ${supervisor.name} to "${selectedProposal.title}"`, { variant: 'success' });
    setAssignDialog(false);
    setSelectedProposal(null);
    setSelectedSupervisorId('');
  };

  const handleStatusChange = (proposalId: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    updateProposal(proposalId, {
      status: newStatus,
      reviewedAt: new Date().toISOString(),
    });
    enqueueSnackbar('Proposal status updated', { variant: 'success' });
  };

  const getSupervisorWorkload = (supervisorId: string) => {
    return proposals.filter(p => p.supervisorId === supervisorId && p.status === 'approved').length;
  };

  const getWorkloadPercentage = (supervisorId: string) => {
    const supervisor = supervisors.find(s => s.id === supervisorId);
    if (!supervisor) return 0;
    const workload = getSupervisorWorkload(supervisorId);
    return (workload / supervisor.maxStudents) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
                <p className="text-sm text-gray-600">System Administration</p>
              </div>
            </div>
            <Button variant="outlined" onClick={logout} startIcon={<LogOut className="h-4 w-4" />}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader
              title={
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Total Proposals</span>
                  <FileText className="h-4 w-4 text-gray-400" />
                </div>
              }
              sx={{ pb: 0 }}
            />
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{proposals.length}</div>
              <p className="text-xs text-gray-500 mt-1">All submissions</p>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: '#fef9c3', border: '1px solid #fde047' }}>
            <CardHeader
              title={
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Pending</span>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
              }
              sx={{ pb: 0 }}
            />
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{pendingProposals.length}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: '#dcfce7', border: '1px solid #86efac' }}>
            <CardHeader
              title={
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Approved</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              }
              sx={{ pb: 0 }}
            />
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{approvedProposals.length}</div>
              <p className="text-xs text-gray-500 mt-1">Active projects</p>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: '#fee2e2', border: '1px solid #fca5a5' }}>
            <CardHeader
              title={
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Unassigned</span>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
              }
              sx={{ pb: 0 }}
            />
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{unassignedProposals.length}</div>
              <p className="text-xs text-gray-500 mt-1">Need supervisor</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Supervisor Workload */}
          <Card>
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Supervisor Workload
                </span>
              }
              subheader="Current student allocation per supervisor"
            />
            <CardContent>
              <div className="space-y-6">
                {supervisors.map((supervisor) => {
                  const workload = getSupervisorWorkload(supervisor.id);
                  const percentage = getWorkloadPercentage(supervisor.id);
                  const isOverloaded = workload >= supervisor.maxStudents;
                  const isNearCapacity = workload >= supervisor.maxStudents * 0.8;

                  return (
                    <div key={supervisor.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{supervisor.name}</p>
                          <p className="text-xs text-gray-500">
                            {supervisor.expertise.join(', ')}
                          </p>
                        </div>
                        <Chip
                          label={`${workload} / ${supervisor.maxStudents}`}
                          size="small"
                          color={isOverloaded ? 'error' : isNearCapacity ? 'warning' : 'success'}
                          variant="outlined"
                        />
                      </div>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(percentage, 100)}
                        color={isOverloaded ? 'error' : isNearCapacity ? 'warning' : 'success'}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  System Overview
                </span>
              }
              subheader="Key metrics and insights"
            />
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Total Supervisors</p>
                    <p className="text-2xl font-bold text-blue-600">{supervisors.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-400" />
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Average Response Time</p>
                    <p className="text-2xl font-bold text-purple-600">2.3 days</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-400" />
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Approval Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {proposals.length > 0
                        ? Math.round((approvedProposals.length / proposals.length) * 100)
                        : 0}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Proposals Table */}
        <Card>
          <CardHeader
            title="All Proposals"
            subheader="Manage and monitor all student proposals"
          />
          <CardContent>
            <div className="space-y-4">
              {proposals.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p>No proposals submitted yet</p>
                </div>
              ) : (
                proposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{proposal.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Student: {proposal.studentName}
                        </p>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {proposal.description}
                        </p>
                      </div>
                      <Chip
                        label={proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                        size="small"
                        color={
                          proposal.status === 'pending'
                            ? 'warning'
                            : proposal.status === 'approved'
                            ? 'success'
                            : 'error'
                        }
                        variant="outlined"
                      />
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span>Submitted: {format(new Date(proposal.submittedAt), 'MMM d, yyyy')}</span>
                      {proposal.supervisorName ? (
                        <span className="text-purple-600">
                          Supervisor: {proposal.supervisorName}
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Unassigned
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 items-center">
                      {!proposal.supervisorId && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Users className="h-3 w-3" />}
                          onClick={() => {
                            setSelectedProposal(proposal);
                            setAssignDialog(true);
                          }}
                        >
                          Assign Supervisor
                        </Button>
                      )}

                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={proposal.status}
                          label="Status"
                          onChange={(e) =>
                            handleStatusChange(proposal.id, e.target.value as 'pending' | 'approved' | 'rejected')
                          }
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="approved">Approved</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Assign Supervisor Dialog */}
      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Supervisor</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Select a supervisor for: {selectedProposal?.title}
          </DialogContentText>

          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <p className="text-sm font-medium text-gray-900 mb-1">Student</p>
            <p className="text-sm text-gray-600">{selectedProposal?.studentName}</p>
          </div>

          <FormControl fullWidth>
            <InputLabel>Select Supervisor</InputLabel>
            <Select
              value={selectedSupervisorId}
              label="Select Supervisor"
              onChange={(e) => setSelectedSupervisorId(e.target.value)}
            >
              {supervisors.map((supervisor) => {
                const workload = getSupervisorWorkload(supervisor.id);
                const isAtCapacity = workload >= supervisor.maxStudents;

                return (
                  <MenuItem
                    key={supervisor.id}
                    value={supervisor.id}
                    disabled={isAtCapacity}
                  >
                    <div className="flex items-center justify-between w-full gap-4">
                      <div>
                        <p className="font-medium">{supervisor.name}</p>
                        <p className="text-xs text-gray-500">
                          {supervisor.expertise.slice(0, 2).join(', ')}
                        </p>
                      </div>
                      <Chip
                        label={`${workload}/${supervisor.maxStudents}`}
                        size="small"
                        color={isAtCapacity ? 'error' : 'success'}
                        variant="outlined"
                      />
                    </div>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAssignSupervisor} 
            disabled={!selectedSupervisorId}
            variant="contained"
          >
            Assign Supervisor
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
