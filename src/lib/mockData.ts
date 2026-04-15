import { User, Supervisor, Student, Proposal, Message } from './types';

export const mockSupervisors: Supervisor[] = [
  {
    id: 'sup-1',
    email: 'j.smith@university.edu',
    name: 'Dr. John Smith',
    role: 'supervisor',
    department: 'Computer Science',
    maxStudents: 5,
    currentStudents: 3,
    expertise: ['Machine Learning', 'Data Science', 'AI'],
  },
  {
    id: 'sup-2',
    email: 'e.johnson@university.edu',
    name: 'Prof. Emily Johnson',
    role: 'supervisor',
    department: 'Computer Science',
    maxStudents: 4,
    currentStudents: 4,
    expertise: ['Software Engineering', 'Web Development', 'Cloud Computing'],
  },
  {
    id: 'sup-3',
    email: 'm.brown@university.edu',
    name: 'Dr. Michael Brown',
    role: 'supervisor',
    department: 'Computer Science',
    maxStudents: 5,
    currentStudents: 2,
    expertise: ['Cybersecurity', 'Network Security', 'Cryptography'],
  },
];

export const mockStudents: Student[] = [
  {
    id: 'stu-1',
    email: 'alice.w@student.edu',
    name: 'Alice Williams',
    role: 'student',
    studentId: 'CS2024001',
    supervisorId: 'sup-1',
    department: 'Computer Science',
  },
  {
    id: 'stu-2',
    email: 'bob.d@student.edu',
    name: 'Bob Davis',
    role: 'student',
    studentId: 'CS2024002',
    supervisorId: 'sup-2',
    department: 'Computer Science',
  },
  {
    id: 'stu-3',
    email: 'carol.m@student.edu',
    name: 'Carol Miller',
    role: 'student',
    studentId: 'CS2024003',
    department: 'Computer Science',
  },
];

export const mockAdmin: User = {
  id: 'admin-1',
  email: 'admin@university.edu',
  name: 'System Administrator',
  role: 'admin',
  department: 'Administration',
};

export const mockProposals: Proposal[] = [
  {
    id: 'prop-1',
    studentId: 'stu-1',
    studentName: 'Alice Williams',
    supervisorId: 'sup-1',
    supervisorName: 'Dr. John Smith',
    title: 'Machine Learning for Healthcare Diagnosis',
    description: 'Developing a deep learning model to assist in early detection of diseases from medical imaging data.',
    status: 'approved',
    submittedAt: '2026-01-15T10:00:00Z',
    reviewedAt: '2026-01-17T14:30:00Z',
    feedback: 'Excellent proposal with clear objectives and methodology. Approved.',
    documentName: 'ML_Healthcare_Proposal.pdf',
  },
  {
    id: 'prop-2',
    studentId: 'stu-2',
    studentName: 'Bob Davis',
    supervisorId: 'sup-2',
    supervisorName: 'Prof. Emily Johnson',
    title: 'Cloud-Native E-Commerce Platform',
    description: 'Building a scalable microservices-based e-commerce platform using containerization and Kubernetes.',
    status: 'pending',
    submittedAt: '2026-01-28T09:15:00Z',
    documentName: 'Ecommerce_Platform_Proposal.pdf',
  },
  {
    id: 'prop-3',
    studentId: 'stu-3',
    studentName: 'Carol Miller',
    title: 'Blockchain for Supply Chain Transparency',
    description: 'Implementing a blockchain-based system for tracking products through the supply chain.',
    status: 'rejected',
    submittedAt: '2026-01-20T11:30:00Z',
    reviewedAt: '2026-01-25T16:00:00Z',
    feedback: 'The scope is too broad for a final year project. Please narrow down the focus to a specific use case and resubmit with a more detailed technical approach.',
    documentName: 'Blockchain_Supply_Chain.pdf',
  },
];

export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    proposalId: 'prop-1',
    senderId: 'stu-1',
    senderName: 'Alice Williams',
    senderRole: 'student',
    content: 'Hello Dr. Smith, thank you for approving my proposal! When can we schedule our first meeting?',
    timestamp: '2026-01-18T09:00:00Z',
  },
  {
    id: 'msg-2',
    proposalId: 'prop-1',
    senderId: 'sup-1',
    senderName: 'Dr. John Smith',
    senderRole: 'supervisor',
    content: 'Hi Alice, glad to have you on board. How about Thursday at 2 PM in my office?',
    timestamp: '2026-01-18T10:30:00Z',
  },
  {
    id: 'msg-3',
    proposalId: 'prop-1',
    senderId: 'stu-1',
    senderName: 'Alice Williams',
    senderRole: 'student',
    content: 'Perfect! I will be there. Should I bring anything specific?',
    timestamp: '2026-01-18T11:00:00Z',
  },
];

// Default credentials for testing
export const TEST_CREDENTIALS = {
  student: { email: 'alice.w@student.edu', password: 'student123' },
  supervisor: { email: 'j.smith@university.edu', password: 'supervisor123' },
  admin: { email: 'admin@university.edu', password: 'admin123' },
};
