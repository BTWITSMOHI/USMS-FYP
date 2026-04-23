import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Proposal, Message, Supervisor } from '@/lib/types';
import { mockProposals, mockMessages, mockSupervisors } from '@/lib/mockData';

interface DataContextType {
  proposals: Proposal[];
  messages: Message[];
  supervisors: Supervisor[];
  addProposal: (proposal: Omit<Proposal, 'id' | 'submittedAt'>) => void;
  updateProposal: (id: string, updates: Partial<Proposal>) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  getProposalMessages: (proposalId: string) => Message[];
  getStudentProposals: (studentId: string) => Proposal[];
  getSupervisorProposals: (supervisorId: string) => Proposal[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [supervisors] = useState<Supervisor[]>(mockSupervisors);

  useEffect(() => {
    const storedProposals = localStorage.getItem('proposals');
    const storedMessages = localStorage.getItem('messages');

    if (storedProposals) {
      setProposals(JSON.parse(storedProposals));
    } else {
      setProposals(mockProposals);
      localStorage.setItem('proposals', JSON.stringify(mockProposals));
    }

    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
      setMessages(mockMessages);
      localStorage.setItem('messages', JSON.stringify(mockMessages));
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'proposals' && event.newValue) {
        try {
          setProposals(JSON.parse(event.newValue));
        } catch (error) {
          console.error('Failed to sync proposals from localStorage:', error);
        }
      }

      if (event.key === 'messages' && event.newValue) {
        try {
          setMessages(JSON.parse(event.newValue));
        } catch (error) {
          console.error('Failed to sync messages from localStorage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const addProposal = (proposal: Omit<Proposal, 'id' | 'submittedAt'>) => {
    const newProposal: Proposal = {
      ...proposal,
      id: `prop-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };

    const updatedProposals = [...proposals, newProposal];
    setProposals(updatedProposals);
    localStorage.setItem('proposals', JSON.stringify(updatedProposals));
  };

  const updateProposal = (id: string, updates: Partial<Proposal>) => {
    const updatedProposals = proposals.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    setProposals(updatedProposals);
    localStorage.setItem('proposals', JSON.stringify(updatedProposals));
  };

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
  };

  const getProposalMessages = (proposalId: string) => {
    return messages.filter((m) => m.proposalId === proposalId);
  };

  const getStudentProposals = (studentId: string) => {
    return proposals.filter((p) => p.studentId === studentId);
  };

  const getSupervisorProposals = (supervisorId: string) => {
    return proposals.filter((p) => p.supervisorId === supervisorId);
  };

  return (
    <DataContext.Provider
      value={{
        proposals,
        messages,
        supervisors,
        addProposal,
        updateProposal,
        addMessage,
        getProposalMessages,
        getStudentProposals,
        getSupervisorProposals,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};