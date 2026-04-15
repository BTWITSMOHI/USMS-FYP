import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'supervisor' | 'admin';
  department?: string;
  // Student-specific
  studentId?: string;
  supervisorId?: string;
  // Supervisor-specific
  maxStudents?: number;
  currentStudents?: number;
  expertise?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, enum: ['student', 'supervisor', 'admin'] },
    department: { type: String, default: '' },
    // Student fields
    studentId: { type: String, sparse: true },
    supervisorId: { type: String, default: null },
    // Supervisor fields
    maxStudents: { type: Number, default: 5 },
    currentStudents: { type: Number, default: 0 },
    expertise: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
