import { apiRequest } from './api';

export interface ProjectAttachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  uploadedBy: number;
  uploaderName: string;
  uploadedAt: string;
}

export interface Project {
  id: number;
  proposalId: number;
  studentId: number;
  studentName: string;
  supervisorId: number;
  supervisorName: string;
  title: string;
  description: string;
  technologiesUsed?: string;
  skillsDeveloped?: string;
  additionalNotes?: string;
  githubUrl?: string;
  liveUrl?: string;
  status: 'active' | 'completed' | 'on_hold';
  createdAt: string;
  updatedAt: string;
  proposalDocumentName?: string;
  proposalDocumentUrl?: string;
  attachments?: ProjectAttachment[];
}

export async function fetchProjects(token: string) {
  return apiRequest<{ projects: Project[] }>('/projects', {
    token,
  });
}

export async function fetchProjectById(token: string, projectId: number | string) {
  return apiRequest<{ project: Project }>(`/projects/${projectId}`, {
    token,
  });
}

export async function updateProject(
  token: string,
  projectId: number | string,
  data: {
    technologiesUsed?: string;
    skillsDeveloped?: string;
    additionalNotes?: string;
    githubUrl?: string;
    liveUrl?: string;
    status?: 'active' | 'completed' | 'on_hold';
  }
) {
  return apiRequest<{ message: string; project: Project }>(`/projects/${projectId}`, {
    method: 'PATCH',
    token,
    body: data,
  });
}

export async function addProjectAttachment(
  token: string,
  projectId: number | string,
  data: {
    fileName: string;
    fileUrl: string;
    fileType?: string;
    fileSize?: number;
  }
) {
  return apiRequest<{ message: string; attachment: ProjectAttachment }>(
    `/projects/${projectId}/attachments`,
    {
      method: 'POST',
      token,
      body: data,
    }
  );
}

export async function deleteProjectAttachment(
  token: string,
  projectId: number | string,
  attachmentId: number | string
) {
  return apiRequest<{ message: string }>(
    `/projects/${projectId}/attachments/${attachmentId}`,
    {
      method: 'DELETE',
      token,
    }
  );
}