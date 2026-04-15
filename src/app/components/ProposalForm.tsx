import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { useSnackbar } from 'notistack';

interface ProposalFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProposalForm({ onSuccess, onCancel }: ProposalFormProps) {
  const { user } = useAuth();
  const { addProposal, supervisors } = useData();
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    supervisorId: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB for demo)
      if (file.size > 10 * 1024 * 1024) {
        enqueueSnackbar('File size must be less than 10MB', { variant: 'error' });
        return;
      }
      // Check file type
      const allowedTypes = ['.pdf', '.doc', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        enqueueSnackbar('Only PDF and Word documents are allowed', { variant: 'error' });
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    if (!formData.title || !formData.description) {
      enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate file upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const supervisor = supervisors.find(s => s.id === formData.supervisorId);

      addProposal({
        studentId: user.id,
        studentName: user.name,
        supervisorId: formData.supervisorId || undefined,
        supervisorName: supervisor?.name,
        title: formData.title,
        description: formData.description,
        status: 'pending',
        documentName: uploadedFile?.name,
        documentUrl: uploadedFile ? URL.createObjectURL(uploadedFile) : undefined,
      });

      enqueueSnackbar('Proposal submitted successfully!', { variant: 'success' });
      
      // Reset form
      setFormData({ title: '', description: '', supervisorId: '' });
      setUploadedFile(null);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      enqueueSnackbar('Failed to submit proposal. Please try again.', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TextField
        label="Project Title"
        placeholder="e.g., Machine Learning for Healthcare Diagnosis"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
        fullWidth
      />

      <TextField
        label="Project Description"
        placeholder="Describe your project objectives, methodology, and expected outcomes..."
        multiline
        rows={6}
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        required
        fullWidth
        helperText="Provide a clear and detailed description of your proposed project"
      />

      <FormControl fullWidth>
        <InputLabel>Preferred Supervisor (Optional)</InputLabel>
        <Select
          value={formData.supervisorId}
          label="Preferred Supervisor (Optional)"
          onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value })}
        >
          <MenuItem value="">
            <em>Select a supervisor (or leave blank for admin assignment)</em>
          </MenuItem>
          {supervisors.map((supervisor) => (
            <MenuItem key={supervisor.id} value={supervisor.id}>
              <div className="flex items-center justify-between gap-4 w-full">
                <span>{supervisor.name}</span>
                <span className="text-xs text-gray-500">
                  ({supervisor.currentStudents}/{supervisor.maxStudents} students)
                </span>
              </div>
            </MenuItem>
          ))}
        </Select>
        <p className="text-xs text-gray-500 mt-1">
          Choose a supervisor whose expertise aligns with your project
        </p>
      </FormControl>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Proposal Document (Optional)</p>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <input
            id="document"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="document" className="cursor-pointer">
            {uploadedFile ? (
              <div className="flex items-center justify-center gap-3 text-green-600">
                <CheckCircle className="h-6 w-6" />
                <div className="text-left">
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF or Word document (max 10MB)</p>
              </div>
            )}
          </label>
        </div>
      </div>

      <Alert severity="info" icon={<FileText className="h-4 w-4" />}>
        Your proposal will be reviewed by {formData.supervisorId ? 'your selected supervisor' : 'an administrator who will assign a suitable supervisor'}. You&apos;ll receive feedback within 5-7 business days.
      </Alert>

      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="contained" disabled={isSubmitting} fullWidth>
          {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
