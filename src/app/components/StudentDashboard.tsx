'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
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
  Upload
} from 'lucide-react';
import { Proposal } from '@/lib/types';
import { format } from 'date-fns';

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

export function StudentDashboard() {
  const { user, logout } = useAuth();
  const { getStudentProposals } = useData();
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const proposals = getStudentProposals(user?.id || '');
  const activeProposal = proposals.find(p => p.status === 'approved');

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

  const getStatusColor = (status: string): 'warning' | 'success' | 'error' | 'default' => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Portal</h1>
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
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab 
            label={
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                My Proposals
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
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader 
                  title="Total Proposals" 
                  titleTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                  sx={{ pb: 0 }}
                />
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{proposals.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader 
                  title="Approved" 
                  titleTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                  sx={{ pb: 0 }}
                />
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {proposals.filter(p => p.status === 'approved').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader 
                  title="Pending Review" 
                  titleTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                  sx={{ pb: 0 }}
                />
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">
                    {proposals.filter(p => p.status === 'pending').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Submit New Proposal */}
            {!showProposalForm && (
              <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Upload className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit a New Proposal</h3>
                  <p className="text-sm text-gray-600 mb-6 text-center max-w-md">
                    Ready to start your final year project? Submit your proposal for review.
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
                  subheader="Fill in the details below to submit your proposal for review"
                />
                <CardContent>
                  <ProposalForm
                    onSuccess={() => {
                      setShowProposalForm(false);
                      setActiveTab(0);
                    }}
                    onCancel={() => setShowProposalForm(false)}
                  />
                </CardContent>
              </Card>
            )}

            {/* Proposals List */}
            {proposals.length > 0 && (
              <Card>
                <CardHeader 
                  title="My Proposals"
                  subheader="Track the status of your submitted proposals"
                />
                <CardContent>
                  <div className="space-y-4">
                    {proposals.map((proposal) => (
                      <div
                        key={proposal.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{proposal.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">{proposal.description}</p>
                          </div>
                          <Chip 
                            icon={getStatusIcon(proposal.status) || undefined}
                            label={proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                            color={getStatusColor(proposal.status)}
                            size="small"
                            variant="outlined"
                            className="ml-4"
                          />
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span>Submitted: {format(new Date(proposal.submittedAt), 'MMM d, yyyy')}</span>
                          {proposal.supervisorName && (
                            <span>Supervisor: {proposal.supervisorName}</span>
                          )}
                          {proposal.documentName && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {proposal.documentName}
                            </span>
                          )}
                        </div>

                        {proposal.feedback && (
                          <div className={`p-3 rounded-lg ${
                            proposal.status === 'approved' 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-red-50 border border-red-200'
                          }`}>
                            <p className="text-sm font-medium text-gray-900 mb-1">Feedback:</p>
                            <p className="text-sm text-gray-700">{proposal.feedback}</p>
                          </div>
                        )}

                        {proposal.status === 'approved' && (
                          <div className="mt-3">
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<MessageSquare className="h-4 w-4" />}
                              onClick={() => {
                                setSelectedProposal(proposal);
                                setActiveTab(1);
                              }}
                            >
                              Chat with Supervisor
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {activeProposal ? (
            <Card>
              <CardHeader 
                title={`Chat with ${activeProposal.supervisorName}`}
                subheader={`Project: ${activeProposal.title}`}
              />
              <CardContent>
                <ChatInterface proposalId={activeProposal.id} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
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
