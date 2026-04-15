'use client';

import React from "react"
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import { Send, Paperclip, File } from 'lucide-react';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';

interface ChatInterfaceProps {
  proposalId: string;
}

export function ChatInterface({ proposalId }: ChatInterfaceProps) {
  const { user } = useAuth();
  const { getProposalMessages, addMessage } = useData();
  const { enqueueSnackbar } = useSnackbar();
  const [messageText, setMessageText] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = getProposalMessages(proposalId);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        enqueueSnackbar('File size must be less than 5MB', { variant: 'error' });
        return;
      }
      setAttachedFile(file);
      enqueueSnackbar(`File "${file.name}" attached`, { variant: 'success' });
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim() && !attachedFile) {
      return;
    }

    if (!user) return;

    addMessage({
      proposalId,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      content: messageText.trim(),
      fileName: attachedFile?.name,
      fileUrl: attachedFile ? URL.createObjectURL(attachedFile) : undefined,
    });

    setMessageText('');
    setAttachedFile(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isOwnMessage = (senderId: string) => senderId === user?.id;

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg border">
      {/* Messages Area */}
      <Box 
        ref={scrollRef}
        sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          p: 2 
        }}
      >
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwnMessage(message.senderId) ? 'flex-row-reverse' : ''}`}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: message.senderRole === 'student' ? '#dbeafe' : '#ede9fe',
                    color: message.senderRole === 'student' ? '#2563eb' : '#7c3aed',
                    fontSize: '0.75rem'
                  }}
                >
                  {getInitials(message.senderName)}
                </Avatar>

                <div className={`flex-1 max-w-[70%] ${isOwnMessage(message.senderId) ? 'items-end' : ''}`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className={`text-sm font-medium ${
                      isOwnMessage(message.senderId) ? 'text-right' : ''
                    }`}>
                      {isOwnMessage(message.senderId) ? 'You' : message.senderName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(message.timestamp), 'MMM d, h:mm a')}
                    </span>
                  </div>

                  <div className={`rounded-lg p-3 ${
                    isOwnMessage(message.senderId)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {message.content && (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}

                    {message.fileName && (
                      <div className={`mt-2 pt-2 border-t ${
                        isOwnMessage(message.senderId) ? 'border-blue-500' : 'border-gray-300'
                      }`}>
                        <a
                          href={message.fileUrl}
                          download={message.fileName}
                          className={`flex items-center gap-2 text-sm hover:underline ${
                            isOwnMessage(message.senderId) ? 'text-blue-100' : 'text-blue-600'
                          }`}
                        >
                          <File className="h-4 w-4" />
                          {message.fileName}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Box>

      {/* Input Area */}
      <div className="border-t p-4">
        {attachedFile && (
          <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <File className="h-4 w-4 text-gray-600" />
              <span className="text-gray-700">{attachedFile.name}</span>
              <span className="text-gray-500">
                ({(attachedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <Button
              variant="text"
              size="small"
              onClick={() => setAttachedFile(null)}
            >
              Remove
            </Button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="file"
            id="file-input"
            className="hidden"
            onChange={handleFileAttach}
          />
          <IconButton
            onClick={() => document.getElementById('file-input')?.click()}
            sx={{ border: '1px solid', borderColor: 'divider' }}
          >
            <Paperclip className="h-4 w-4" />
          </IconButton>

          <TextField
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            fullWidth
            size="small"
          />

          <Button 
            type="submit" 
            variant="contained"
            disabled={!messageText.trim() && !attachedFile}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
