import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/lib/types';
import { apiRequest } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  isLoading: boolean;
}

interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: UserRole;
    department?: string;
    studentId?: string;
    expertise?: string | string[];
    maxStudents?: number;
    currentStudents?: number;
  };
}

interface MeResponse {
  user: {
    id: number;
    email: string;
    name: string;
    role: UserRole;
    department?: string;
    studentId?: string;
    expertise?: string | string[];
    maxStudents?: number;
    currentStudents?: number;
  };
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

function normalizeUser(user: LoginResponse['user'] | MeResponse['user']): User {
  return {
    id: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role,
    department: user.department,
    ...(user.role === 'student' && user.studentId
      ? { studentId: user.studentId }
      : {}),
    ...(user.role === 'supervisor'
      ? {
          maxStudents: user.maxStudents ?? 0,
          currentStudents: user.currentStudents ?? 0,
          expertise: Array.isArray(user.expertise)
            ? user.expertise
            : user.expertise
              ? user.expertise.split(',').map((item) => item.trim())
              : [],
        }
      : {}),
  } as User;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await apiRequest<MeResponse>('/auth/me', {
          token: storedToken,
        });

        setToken(storedToken);
        setUser(normalizeUser(data.user));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      const normalizedUser = normalizeUser(data.user);

      setToken(data.token);
      setUser(normalizedUser);
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(normalizedUser));

      return true;
    } catch {
      return false;
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ): Promise<boolean> => {
    try {
      const registerBody =
        role === 'student'
          ? {
              email,
              password,
              name,
              role,
              department: 'Computer Science',
              studentId: `w${Date.now().toString().slice(-7)}`,
            }
          : role === 'supervisor'
            ? {
                email,
                password,
                name,
                role,
                department: 'Computer Science',
                expertise: 'Software Engineering',
                maxStudents: 5,
              }
            : {
                email,
                password,
                name,
                role,
                department: 'Administration',
              };

      await apiRequest('/auth/register', {
        method: 'POST',
        body: registerBody,
      });

      return await login(email, password);
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, signup, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};