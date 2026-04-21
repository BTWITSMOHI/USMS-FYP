'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Project,
  ProjectAttachment,
  fetchProjectById,
  updateProject,
  addProjectAttachment,
  deleteProjectAttachment,
} from '@/lib/projects';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { useSnackbar } from 'notistack';
import {
  ArrowLeft,
  Github,
  Globe,
  FileText,
  Upload,
  Trash2,
  Edit3,
  Save,
  X,
  ExternalLink,
  Code,
  Lightbulb,
  StickyNote,
  User,
  Calendar,
  Paperclip,
} from 'lucide-react';
import { format } from 'date-fns';

interface ProjectViewProps {
  projectId: number;
  onBack: () => void;
}

export function ProjectView({ projectId, onBack }: ProjectViewProps) {
  const { token, user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [technologiesUsed, setTechnologiesUsed] = useState('');
  const [skillsDeveloped, setSkillsDeveloped] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [status, setStatus] = useState<'active' | 'completed' | 'on_hold'>('active');

  // Attachment dialog state
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [attachmentFileName, setAttachmentFileName] = useState('');
  const [attachmentFileUrl, setAttachmentFileUrl] = useState('');
  const [addingAttachment, setAddingAttachment] = useState(false);

  const loadProject = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await fetchProjectById(token, projectId);
      setProject(data.project);

      // Initialize form state
      setTechnologiesUsed(data.project.technologiesUsed || '');
      setSkillsDeveloped(data.project.skillsDeveloped || '');
      setAdditionalNotes(data.project.additionalNotes || '');
      setGithubUrl(data.project.githubUrl || '');
      setLiveUrl(data.project.liveUrl || '');
      setStatus(data.project.status);
    } catch (error) {
      console.error('Failed to load project:', error);
      enqueueSnackbar('Failed to load project', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [token, projectId]);

  const handleSave = async () => {
    if (!token || !project) return;

    try {
      setSaving(true);
      await updateProject(token, project.id, {
        technologiesUsed,
        skillsDeveloped,
        additionalNotes,
        githubUrl,
        liveUrl,
        status,
      });
      enqueueSnackbar('Project updated successfully', { variant: 'success' });
      setEditing(false);
      await loadProject();
    } catch (error) {
      console.error('Failed to update project:', error);
      enqueueSnackbar('Failed to update project', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (project) {
      setTechnologiesUsed(project.technologiesUsed || '');
      setSkillsDeveloped(project.skillsDeveloped || '');
      setAdditionalNotes(project.additionalNotes || '');
      setGithubUrl(project.githubUrl || '');
      setLiveUrl(project.liveUrl || '');
      setStatus(project.status);
    }
    setEditing(false);
  };

  const handleAddAttachment = async () => {
    if (!token || !project || !attachmentFileName || !attachmentFileUrl) return;

    try {
      setAddingAttachment(true);
      await addProjectAttachment(token, project.id, {
        fileName: attachmentFileName,
        fileUrl: attachmentFileUrl,
      });
      enqueueSnackbar('Attachment added successfully', { variant: 'success' });
      setAttachmentDialogOpen(false);
      setAttachmentFileName('');
      setAttachmentFileUrl('');
      await loadProject();
    } catch (error) {
      console.error('Failed to add attachment:', error);
      enqueueSnackbar('Failed to add attachment', { variant: 'error' });
    } finally {
      setAddingAttachment(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (!token || !project) return;

    const confirmed = window.confirm('Are you sure you want to delete this attachment?');
    if (!confirmed) return;

    try {
      await deleteProjectAttachment(token, project.id, attachmentId);
      enqueueSnackbar('Attachment deleted successfully', { variant: 'success' });
      await loadProject();
    } catch (error) {
      console.error('Failed to delete attachment:', error);
      enqueueSnackbar('Failed to delete attachment', { variant: 'error' });
    }
  };

  const getStatusColor = (s: string): 'success' | 'warning' | 'default' => {
    switch (s) {
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

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'active':
        return 'Active';
      case 'on_hold':
        return 'On Hold';
      case 'completed':
        return 'Completed';
      default:
        return s;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <CircularProgress />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Project not found</p>
        <Button onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outlined"
            startIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={onBack}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <p className="text-sm text-gray-600">
              {user?.role === 'student'
                ? `Supervised by ${project.supervisorName}`
                : `Student: ${project.studentName}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Chip
            label={getStatusLabel(project.status)}
            color={getStatusColor(project.status)}
            size="small"
          />
          {!editing ? (
            <Button
              variant="contained"
              startIcon={<Edit3 className="h-4 w-4" />}
              onClick={() => setEditing(true)}
            >
              Edit Project
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outlined"
                startIcon={<X className="h-4 w-4" />}
                onClick={handleCancelEdit}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<Save className="h-4 w-4" />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Project Details */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          <Card>
            <CardHeader title="Project Description" />
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
            </CardContent>
          </Card>

          {/* Technologies Used */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-gray-600" />
                  <span>Technologies Used</span>
                </div>
              }
            />
            <CardContent>
              {editing ? (
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  value={technologiesUsed}
                  onChange={(e) => setTechnologiesUsed(e.target.value)}
                  placeholder="e.g., React, Node.js, PostgreSQL, Docker..."
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {project.technologiesUsed || (
                    <span className="text-gray-400 italic">No technologies listed yet</span>
                  )}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Skills Developed */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-gray-600" />
                  <span>Skills Developed</span>
                </div>
              }
            />
            <CardContent>
              {editing ? (
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  value={skillsDeveloped}
                  onChange={(e) => setSkillsDeveloped(e.target.value)}
                  placeholder="e.g., API design, database management, testing..."
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {project.skillsDeveloped || (
                    <span className="text-gray-400 italic">No skills listed yet</span>
                  )}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <StickyNote className="h-5 w-5 text-gray-600" />
                  <span>Additional Notes</span>
                </div>
              }
            />
            <CardContent>
              {editing ? (
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any additional information about the project..."
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {project.additionalNotes || (
                    <span className="text-gray-400 italic">No additional notes yet</span>
                  )}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <Paperclip className="h-5 w-5 text-gray-600" />
                  <span>Attachments</span>
                </div>
              }
              action={
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Upload className="h-4 w-4" />}
                  onClick={() => setAttachmentDialogOpen(true)}
                >
                  Add Attachment
                </Button>
              }
            />
            <CardContent>
              {project.attachments && project.attachments.length > 0 ? (
                <div className="space-y-3">
                  {project.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <a
                            href={attachment.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {attachment.fileName}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <p className="text-xs text-gray-500">
                            Uploaded by {attachment.uploaderName} on{' '}
                            {format(new Date(attachment.uploadedAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteAttachment(attachment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic text-center py-6">
                  No attachments yet. Add documents, reports, or other files.
                </p>
              )}

              {project.proposalDocumentUrl && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Original Proposal Document:
                  </p>
                  <a
                    href={project.proposalDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    {project.proposalDocumentName || 'View Document'}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Links Card */}
          <Card>
            <CardHeader title="Project Links" />
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <TextField
                    fullWidth
                    label="GitHub URL"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    InputProps={{
                      startAdornment: <Github className="h-4 w-4 mr-2 text-gray-400" />,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Live URL"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://..."
                    InputProps={{
                      startAdornment: <Globe className="h-4 w-4 mr-2 text-gray-400" />,
                    }}
                  />
                </>
              ) : (
                <>
                  {project.githubUrl ? (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <Github className="h-5 w-5" />
                      <span className="font-medium">GitHub Repository</span>
                      <ExternalLink className="h-4 w-4 ml-auto text-gray-400" />
                    </a>
                  ) : (
                    <p className="text-gray-400 text-sm">No GitHub link added</p>
                  )}
                  {project.liveUrl ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <Globe className="h-5 w-5" />
                      <span className="font-medium">Live Demo</span>
                      <ExternalLink className="h-4 w-4 ml-auto text-gray-400" />
                    </a>
                  ) : (
                    <p className="text-gray-400 text-sm">No live URL added</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Status Card */}
          {editing && (
            <Card>
              <CardHeader title="Project Status" />
              <CardContent>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={status}
                    label="Status"
                    onChange={(e) =>
                      setStatus(e.target.value as 'active' | 'completed' | 'on_hold')
                    }
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="on_hold">On Hold</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card>
            <CardHeader title="Project Information" />
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Student</p>
                  <p className="font-medium">{project.studentName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Supervisor</p>
                  <p className="font-medium">{project.supervisorName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="font-medium">
                    {format(new Date(project.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="font-medium">
                    {format(new Date(project.updatedAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Attachment Dialog */}
      <Dialog
        open={attachmentDialogOpen}
        onClose={() => !addingAttachment && setAttachmentDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Attachment</DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-2">
            <TextField
              fullWidth
              label="File Name"
              value={attachmentFileName}
              onChange={(e) => setAttachmentFileName(e.target.value)}
              placeholder="e.g., Final Report.docx"
            />
            <TextField
              fullWidth
              label="File URL"
              value={attachmentFileUrl}
              onChange={(e) => setAttachmentFileUrl(e.target.value)}
              placeholder="https://..."
              helperText="Enter the URL where the file is hosted (Google Drive, Dropbox, etc.)"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setAttachmentDialogOpen(false)}
            disabled={addingAttachment}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddAttachment}
            variant="contained"
            disabled={addingAttachment || !attachmentFileName || !attachmentFileUrl}
          >
            {addingAttachment ? 'Adding...' : 'Add Attachment'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
