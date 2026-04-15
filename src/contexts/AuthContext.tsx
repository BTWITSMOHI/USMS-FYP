import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/lib/types';
import { mockSupervisors, mockStudents, mockAdmin, TEST_CREDENTIALS } from '@/lib/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check against test credentials
    let authenticatedUser: User | null = null;

    if (email === TEST_CREDENTIALS.student.email && password === TEST_CREDENTIALS.student.password) {
      authenticatedUser = mockStudents.find(s => s.email === email) || null;
    } else if (email === TEST_CREDENTIALS.supervisor.email && password === TEST_CREDENTIALS.supervisor.password) {
      authenticatedUser = mockSupervisors.find(s => s.email === email) || null;
    } else if (email === TEST_CREDENTIALS.admin.email && password === TEST_CREDENTIALS.admin.password) {
      authenticatedUser = mockAdmin;
    }

    // Also check all mock users
    if (!authenticatedUser) {
      const allUsers = [...mockStudents, ...mockSupervisors, mockAdmin];
      authenticatedUser = allUsers.find(u => u.email === email) || null;
    }

    if (authenticatedUser) {
      setUser(authenticatedUser);
      localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
      return true;
    }

    return false;
  };

  const signup = async (email: string, password: string, name: string, role: UserRole): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user already exists
    const allUsers = [...mockStudents, ...mockSupervisors, mockAdmin];
    if (allUsers.find(u => u.email === email)) {
      return false;
    }

    // Create new user
    const newUser: User = {
      id: `${role}-${Date.now()}`,
      email,
      name,
      role,
      department: role === 'student' ? 'Computer Science' : 'Computer Science',
    };

    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    // Store user in localStorage for future logins
    const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    storedUsers.push({ ...newUser, password });
    localStorage.setItem('registeredUsers', JSON.stringify(storedUsers));

    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
