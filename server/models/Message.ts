import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  proposalId: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'supervisor' | 'admin';
  content: string;
  timestamp: Date;
  fileUrl?: string;
  fileName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    proposalId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, required: true, enum: ['student', 'supervisor', 'admin'] },
    content: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
    fileUrl: { type: String, default: null },
    fileName: { type: String, default: null },
  },
  { timestamps: true }
);

export const Message = mongoose.model<IMessage>('Message', messageSchema);
