'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import { ChatInterface } from '@/app/components/ChatInterface';
import { 
  UserCircle, 
  LogOut, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  Download,
  Users
} from 'lucide-react';
import { Proposal } from '@/lib/types';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

export function SupervisorDashboard() {
  const { user, logout } = useAuth();
  const { getSupervisorProposals, updateProposal } = useData();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [chatDialog, setChatDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const proposals = getSupervisorProposals(user?.id || '');
  const pendingProposals = proposals.filter(p => p.status === 'pending');
  const approvedProposals = proposals.filter(p => p.status === 'approved');
  const rejectedProposals = proposals.filter(p => p.status === 'rejected');

  const openReviewDialog = (proposal: Proposal, action: 'approve' | 'reject') => {
    setSelectedProposal(proposal);
    setReviewAction(action);
    setFeedback('');
    setReviewDialog(true);
  };

  const handleReview = async () => {
    if (!selectedProposal) return;

    if (reviewAction === 'reject' && !feedback.trim()) {
      enqueueSnackbar('Feedback is required when rejecting a proposal', { variant: 'error' });
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      updateProposal(selectedProposal.id, {
        status: reviewAction === 'approve' ? 'approved' : 'rejected',
        feedback: feedback.trim() || (reviewAction === 'approve' ? 'Proposal approved. Looking forward to working with you!' : undefined),
        reviewedAt: new Date().toISOString(),
      });

      enqueueSnackbar(
        reviewAction === 'approve' 
          ? 'Proposal approved successfully!' 
          : 'Proposal rejected with feedback',
        { variant: 'success' }
      );

      setReviewDialog(false);
      setSelectedProposal(null);
      setFeedback('');
    } catch (error) {
      enqueueSnackbar('Failed to submit review. Please try again.', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ProposalCard = ({ proposal }: { proposal: Proposal }) => (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{proposal.title}</h3>
          <p className="text-sm text-gray-600 mb-2">by {proposal.studentName}</p>
          <p className="text-sm text-gray-700 line-clamp-2">{proposal.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
        <span>Submitted: {format(new Date(proposal.submittedAt), 'MMM d, yyyy')}</span>
        {proposal.documentName && (
          <button className="flex items-center gap-1 text-blue-600 hover:underline">
            <Download className="h-3 w-3" />
            {proposal.documentName}
          </button>
        )}
      </div>

      {proposal.status === 'pending' ? (
        <div className="flex gap-2">
          <Button
            size="small"
            variant="contained"
            color="primary"
            className="flex-1"
            startIcon={<CheckCircle className="h-4 w-4" />}
            onClick={() => openReviewDialog(proposal, 'approve')}
          >
            Approve
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            className="flex-1"
            startIcon={<XCircle className="h-4 w-4" />}
            onClick={() => openReviewDialog(proposal, 'reject')}
          >
            Reject
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {proposal.feedback && (
            <div className={`p-3 rounded-lg ${
              proposal.status === 'approved' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className="text-sm font-medium text-gray-900 mb-1">Your Feedback:</p>
              <p className="text-sm text-gray-700">{proposal.feedback}</p>
            </div>
          )}
          
          {proposal.status === 'approved' && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<MessageSquare className="h-4 w-4" />}
              onClick={() => {
                setSelectedProposal(proposal);
                setChatDialog(true);
              }}
            >
              Open Chat
            </Button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserCircle className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Supervisor Portal</h1>
                <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
              </div>
            </div>
            <Button variant="outlined" onClick={logout} startIcon={<LogOut className="h-4 w-4" />}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader 
              title="Total Students" 
              titleTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              sx={{ pb: 0 }}
            />
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{proposals.length}</div>
            </CardContent>
          </Card>
          <Card sx={{ bgcolor: 'warning.light', borderColor: 'warning.main' }}>
            <CardHeader 
              title="Pending Review" 
              titleTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              sx={{ pb: 0 }}
            />
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{pendingProposals.length}</div>
            </CardContent>
          </Card>
          <Card sx={{ bgcolor: 'success.light', borderColor: 'success.main' }}>
            <CardHeader 
              title="Approved" 
              titleTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              sx={{ pb: 0 }}
            />
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{approvedProposals.length}</div>
            </CardContent>
          </Card>
          <Card sx={{ bgcolor: 'error.light', borderColor: 'error.main' }}>
            <CardHeader 
              title="Rejected" 
              titleTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              sx={{ pb: 0 }}
            />
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{rejectedProposals.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Proposals Tabs */}
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab 
            label={
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending ({pendingProposals.length})
              </span>
            } 
          />
          <Tab 
            label={
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Approved ({approvedProposals.length})
              </span>
            } 
          />
          <Tab 
            label={
              <span className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Rejected ({rejectedProposals.length})
              </span>
            } 
          />
          <Tab 
            label={
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                All ({proposals.length})
              </span>
            } 
          />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Card>
            <CardHeader 
              title="Proposals Awaiting Review"
              subheader="Review and provide feedback on student proposals"
            />
            <CardContent>
              {pendingProposals.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p>No pending proposals</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingProposals.map(proposal => (
                    <ProposalCard key={proposal.id} proposal={proposal} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Card>
            <CardHeader 
              title="Approved Proposals"
              subheader="Students you are currently supervising"
            />
            <CardContent>
              {approvedProposals.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p>No approved proposals yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {approvedProposals.map(proposal => (
                    <ProposalCard key={proposal.id} proposal={proposal} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Card>
            <CardHeader 
              title="Rejected Proposals"
              subheader="Proposals that need revision"
            />
            <CardContent>
              {rejectedProposals.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p>No rejected proposals</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rejectedProposals.map(proposal => (
                    <ProposalCard key={proposal.id} proposal={proposal} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Card>
            <CardHeader 
              title="All Proposals"
              subheader="Complete overview of all student proposals"
            />
            <CardContent>
              {proposals.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p>No proposals yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {proposals.map(proposal => (
                    <ProposalCard key={proposal.id} proposal={proposal} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </main>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={() => setReviewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {reviewAction === 'approve' ? 'Approve Proposal' : 'Reject Proposal'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {selectedProposal?.title} by {selectedProposal?.studentName}
          </DialogContentText>

          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <p className="text-sm text-gray-700">{selectedProposal?.description}</p>
          </div>

          <TextField
            label={`Feedback ${reviewAction === 'reject' ? '*' : '(optional)'}`}
            placeholder={
              reviewAction === 'approve'
                ? 'Provide positive feedback and guidance (optional)'
                : 'Explain why the proposal needs revision and provide guidance for improvement'
            }
            multiline
            rows={6}
            fullWidth
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required={reviewAction === 'reject'}
            helperText={reviewAction === 'reject' ? 'Constructive feedback is required to help the student improve their proposal' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog(false)}>Cancel</Button>
          <Button
            onClick={handleReview}
            disabled={isSubmitting || (reviewAction === 'reject' && !feedback.trim())}
            variant="contained"
            color={reviewAction === 'approve' ? 'primary' : 'error'}
          >
            {isSubmitting ? 'Submitting...' : reviewAction === 'approve' ? 'Approve Proposal' : 'Reject Proposal'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog open={chatDialog} onOpenChange={() => setChatDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chat with {selectedProposal?.studentName}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Project: {selectedProposal?.title}
          </DialogContentText>
          {selectedProposal && (
            <ChatInterface proposalId={selectedProposal.id} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
