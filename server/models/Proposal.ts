import mongoose, { Schema, Document } from 'mongoose';

export interface IProposal extends Document {
  studentId: string;
  studentName: string;
  supervisorId?: string;
  supervisorName?: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  feedback?: string;
  documentUrl?: string;
  documentName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const proposalSchema = new Schema<IProposal>(
  {
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    supervisorId: { type: String, default: null, index: true },
    supervisorName: { type: String, default: null },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    status: { type: String, required: true, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date, default: null },
    feedback: { type: String, default: null },
    documentUrl: { type: String, default: null },
    documentName: { type: String, default: null },
  },
  { timestamps: true }
);

export const Proposal = mongoose.model<IProposal>('Proposal', proposalSchema);
