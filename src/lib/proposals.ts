import { apiRequest } from './api';

export async function fetchProposals(token: string) {
  return apiRequest<{ proposals: any[] }>('/proposals', {
    token,
  });
}

export async function fetchSupervisors(token: string) {
  return apiRequest<{ supervisors: any[] }>('/supervisors', {
    token,
  });
}

export async function createProposal(
  token: string,
  data: {
    title: string;
    description: string;
    supervisorId?: number;
  }
) {
  return apiRequest('/proposals', {
    method: 'POST',
    token,
    body: data,
  });
}

export async function reviewProposal(
  token: string,
  proposalId: string | number,
  data: {
    status: 'approved' | 'rejected';
    feedback: string;
  }
) {
  return apiRequest(`/proposals/${proposalId}/review`, {
    method: 'PATCH',
    token,
    body: data,
  });
}

export async function assignSupervisor(
  token: string,
  proposalId: string | number,
  supervisorId: number
) {
  return apiRequest(`/proposals/${proposalId}/assign`, {
    method: 'PATCH',
    token,
    body: { supervisorId },
  });
}

export async function deleteProposal(
  token: string,
  proposalId: string | number
) {
  return apiRequest(`/proposals/${proposalId}`, {
    method: 'DELETE',
    token,
  });
}

export async function fetchProposalMessages(
  token: string,
  proposalId: number | string
) {
  return apiRequest<{ messages: any[] }>(`/proposals/${proposalId}/messages`, {
    token,
  });
}

export async function sendProposalMessage(
  token: string,
  proposalId: number | string,
  data: {
    content: string;
  }
) {
  return apiRequest<{ message: string; data: any }>(`/proposals/${proposalId}/messages`, {
    method: 'POST',
    token,
    body: data,
  });
}

export async function updateProposal(
  token: string,
  proposalId: number | string,
  data: {
    title?: string;
    description?: string;
    supervisorId?: number | null;
    documentName?: string | null;
    documentUrl?: string | null;
  }
) {
  return apiRequest<{ message: string; proposal: any }>(`/proposals/${proposalId}`, {
    method: 'PATCH',
    token,
    body: data,
  });
}