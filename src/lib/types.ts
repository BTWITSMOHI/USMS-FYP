export type UserRole = 'student' | 'supervisor' | 'admin';

export type ProposalStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
}

export interface Student extends User {
  role: 'student';
  studentId: string;
  supervisorId?: string;
}

export interface Supervisor extends User {
  role: 'supervisor';
  maxStudents: number;
  currentStudents: number;
  expertise: string[];
}

export interface Admin extends User {
  role: 'admin';
}

export interface Proposal {
  id: string;
  studentId: string;
  studentName: string;
  supervisorId?: string;
  supervisorName?: string;
  title: string;
  description: string;
  status: ProposalStatus;
  submittedAt: string;
  reviewedAt?: string;
  feedback?: string;
  documentUrl?: string;
  documentName?: string;
}

export interface Message {
  id: string;
  proposalId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
  fileUrl?: string;
  fileName?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
}
