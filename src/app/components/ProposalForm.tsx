'use client';

import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/contexts/AuthContext';
import { createProposal, fetchSupervisors } from '@/lib/proposals';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';

interface ProposalFormProps {
  onSuccess?: () => void | Promise<void>;
  onCancel?: () => void;
}

interface SupervisorOption {
  id: number;
  name: string;
  email: string;
  department?: string;
  expertise?: string;
  maxStudents?: number;
  currentStudents?: number;
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    backgroundColor: '#fff',
  },
};

export function ProposalForm({ onSuccess, onCancel }: ProposalFormProps) {
  const { token } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [supervisorId, setSupervisorId] = useState('any');
  const [supervisors, setSupervisors] = useState<SupervisorOption[]>([]);
  const [loadingSupervisors, setLoadingSupervisors] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadSupervisors = async () => {
      if (!token) {
        setLoadingSupervisors(false);
        return;
      }

      try {
        const data = await fetchSupervisors(token);
        setSupervisors(data.supervisors);
      } catch (error) {
        console.error('Failed to load supervisors', error);
        enqueueSnackbar('Failed to load supervisors', { variant: 'error' });
      } finally {
        setLoadingSupervisors(false);
      }
    };

    loadSupervisors();
  }, [token, enqueueSnackbar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !supervisorId) {
      enqueueSnackbar('Please fill in all required fields', { variant: 'warning' });
      return;
    }

    if (!token) {
      enqueueSnackbar('You must be logged in', { variant: 'error' });
      return;
    }

    try {
      setSubmitting(true);

      const payload =
        supervisorId === 'any'
          ? {
              title: title.trim(),
              description: description.trim(),
            }
          : {
              title: title.trim(),
              description: description.trim(),
              supervisorId: Number(supervisorId),
            };

      await createProposal(token, payload as any);

      enqueueSnackbar('Proposal submitted successfully', { variant: 'success' });

      setTitle('');
      setDescription('');
      setSupervisorId('any');

      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      console.error('Proposal submit error:', error);
      enqueueSnackbar('Failed to submit proposal', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSupervisors) {
    return (
      <div className="flex items-center justify-center py-8">
        <CircularProgress />
      </div>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} className="space-y-4">
      <TextField
        fullWidth
        label="Project Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        sx={fieldSx}
      />

      <TextField
        fullWidth
        label="Project Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        multiline
        minRows={6}
        sx={fieldSx}
      />

      <TextField
        select
        fullWidth
        label="Preferred Supervisor"
        value={supervisorId}
        onChange={(e) => setSupervisorId(e.target.value)}
        required
        sx={fieldSx}
      >
        <MenuItem value="any">Any Supervisor</MenuItem>

        {supervisors.map((supervisor) => (
          <MenuItem key={supervisor.id} value={supervisor.id}>
            {supervisor.name}
            {supervisor.expertise ? ` — ${supervisor.expertise}` : ''}
          </MenuItem>
        ))}
      </TextField>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          sx={{
            borderRadius: '14px',
            px: 3,
            py: 1.3,
            fontSize: '0.98rem',
            fontWeight: 600,
            textTransform: 'none',
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Proposal'}
        </Button>

        {onCancel && (
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={submitting}
            sx={{
              borderRadius: '14px',
              px: 3,
              py: 1.3,
              fontSize: '0.98rem',
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
        )}
      </div>
    </Box>
  );
}