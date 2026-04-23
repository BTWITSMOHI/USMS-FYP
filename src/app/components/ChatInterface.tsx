'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Send } from 'lucide-react';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';
import {
  fetchProposalMessages,
  sendProposalMessage,
} from '@/lib/proposals';

interface ChatMessage {
  id: number | string;
  proposalId: number | string;
  senderId: number | string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
}

interface ChatInterfaceProps {
  proposalId: number | string;
}

export function ChatInterface({ proposalId }: ChatInterfaceProps) {
  const { user, token } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const loadMessages = async (showLoader = false) => {
    if (!token || !proposalId) return;

    try {
      if (showLoader) setLoading(true);

      const data = await fetchProposalMessages(token, proposalId);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
      if (showLoader) {
        enqueueSnackbar('Failed to load messages', { variant: 'error' });
      }
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages(true);

    if (!token || !proposalId) return;

    const interval = setInterval(() => {
      loadMessages(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [token, proposalId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim() || !token) return;

    try {
      setSending(true);

      await sendProposalMessage(token, proposalId, {
        content: messageText.trim(),
      });

      setMessageText('');
      await loadMessages(false);
    } catch (error) {
      console.error('Failed to send message:', error);
      enqueueSnackbar('Failed to send message', { variant: 'error' });
    } finally {
      setSending(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isOwnMessage = (senderId: string | number) => {
    return String(senderId) === String(user?.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg border">
      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
        }}
      >
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No messages yet. Start the conversation.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  isOwnMessage(message.senderId) ? 'flex-row-reverse' : ''
                }`}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor:
                      message.senderRole === 'student' ? '#dbeafe' : '#ede9fe',
                    color:
                      message.senderRole === 'student' ? '#2563eb' : '#7c3aed',
                    fontSize: '0.75rem',
                  }}
                >
                  {getInitials(message.senderName)}
                </Avatar>

                <div
                  className={`flex-1 max-w-[70%] ${
                    isOwnMessage(message.senderId) ? 'items-end' : ''
                  }`}
                >
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {isOwnMessage(message.senderId) ? 'You' : message.senderName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(message.timestamp), 'MMM d, h:mm a')}
                    </span>
                  </div>

                  <div
                    className={`rounded-lg p-3 ${
                      isOwnMessage(message.senderId)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Box>

      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <TextField
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            fullWidth
            size="small"
            disabled={sending}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={!messageText.trim() || sending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}