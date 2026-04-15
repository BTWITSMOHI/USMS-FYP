'use client';

import React from "react"
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { GraduationCap, UserCircle, Shield, AlertCircle } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { useSnackbar } from 'notistack';

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

export function AuthSection() {
  const { login, signup } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('student');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const success = await login(loginEmail, loginPassword);
      if (!success) {
        setError('Invalid email or password');
      }
    } catch {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const success = await signup(signupEmail, signupPassword, signupName, signupRole);
      if (success) {
        enqueueSnackbar('Account created successfully!', { variant: 'success' });
      } else {
        setError('Email already exists');
      }
    } catch {
      setError('An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (role: 'student' | 'supervisor' | 'admin') => {
    const credentials = {
      student: { email: 'alice.w@student.edu', password: 'student123' },
      supervisor: { email: 'j.smith@university.edu', password: 'supervisor123' },
      admin: { email: 'admin@university.edu', password: 'admin123' },
    };
    setLoginEmail(credentials[role].email);
    setLoginPassword(credentials[role].password);
    setActiveTab(0);
  };

  return (
    <section id="auth" className="px-6 py-24 md:py-32 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-medium tracking-wide uppercase text-gray-500 mb-3">
            Get Started
          </p>
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-gray-900 text-balance mb-4">
            Sign in or create your account
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Access your personalized dashboard based on your role. Try one of the demo accounts below to explore the platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Login / Signup Card */}
          <Card>
            <CardHeader 
              title="Welcome"
              subheader="Sign in to your account or create a new one"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Tabs 
                value={activeTab} 
                onChange={(_, newValue) => setActiveTab(newValue)}
                variant="fullWidth"
                sx={{ mb: 2 }}
              >
                <Tab label="Login" />
                <Tab label="Sign Up" />
              </Tabs>

              <TabPanel value={activeTab} index={0}>
                <form onSubmit={handleLogin} className="space-y-4">
                  <TextField
                    label="Email"
                    type="email"
                    placeholder="your.email@university.edu"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    fullWidth
                  />

                  {error && activeTab === 0 && (
                    <Alert severity="error" icon={<AlertCircle className="h-4 w-4" />}>
                      {error}
                    </Alert>
                  )}

                  <Button type="submit" variant="contained" fullWidth disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <form onSubmit={handleSignup} className="space-y-4">
                  <TextField
                    label="Full Name"
                    type="text"
                    placeholder="John Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Email"
                    type="email"
                    placeholder="your.email@university.edu"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Password"
                    type="password"
                    placeholder="Create a password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    fullWidth
                  />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">I am a...</p>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant={signupRole === 'student' ? 'contained' : 'outlined'}
                        onClick={() => setSignupRole('student')}
                        className="flex flex-col items-center py-4"
                        sx={{ flexDirection: 'column', py: 2 }}
                      >
                        <GraduationCap className="h-4 w-4 mb-1" />
                        <span className="text-xs">Student</span>
                      </Button>
                      <Button
                        type="button"
                        variant={signupRole === 'supervisor' ? 'contained' : 'outlined'}
                        onClick={() => setSignupRole('supervisor')}
                        sx={{ flexDirection: 'column', py: 2 }}
                      >
                        <UserCircle className="h-4 w-4 mb-1" />
                        <span className="text-xs">Supervisor</span>
                      </Button>
                      <Button
                        type="button"
                        variant={signupRole === 'admin' ? 'contained' : 'outlined'}
                        onClick={() => setSignupRole('admin')}
                        sx={{ flexDirection: 'column', py: 2 }}
                      >
                        <Shield className="h-4 w-4 mb-1" />
                        <span className="text-xs">Admin</span>
                      </Button>
                    </div>
                  </div>

                  {error && activeTab === 1 && (
                    <Alert severity="error" icon={<AlertCircle className="h-4 w-4" />}>
                      {error}
                    </Alert>
                  )}

                  <Button type="submit" variant="contained" fullWidth disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabPanel>
            </CardContent>
          </Card>

          {/* Demo Credentials */}
          <div className="space-y-4">
            <h3 className="text-base font-medium text-gray-900">Try a demo account</h3>
            <p className="text-sm text-gray-500">
              Click any role below to auto-fill the login form with demo credentials.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => fillDemoCredentials('student')}
                className="w-full p-5 bg-white rounded-xl border border-gray-200 hover:border-gray-400 transition-colors text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-900 flex-shrink-0">
                    <GraduationCap className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm mb-0.5">Student Account</h4>
                    <p className="text-xs text-gray-500 mb-2">alice.w@student.edu</p>
                    <ul className="text-xs text-gray-500 space-y-0.5">
                      <li>Submit project proposals</li>
                      <li>Track approval status</li>
                      <li>Chat with supervisor</li>
                    </ul>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoCredentials('supervisor')}
                className="w-full p-5 bg-white rounded-xl border border-gray-200 hover:border-gray-400 transition-colors text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-900 flex-shrink-0">
                    <UserCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm mb-0.5">Supervisor Account</h4>
                    <p className="text-xs text-gray-500 mb-2">j.smith@university.edu</p>
                    <ul className="text-xs text-gray-500 space-y-0.5">
                      <li>Review student proposals</li>
                      <li>Approve or reject with feedback</li>
                      <li>Manage student communications</li>
                    </ul>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoCredentials('admin')}
                className="w-full p-5 bg-white rounded-xl border border-gray-200 hover:border-gray-400 transition-colors text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-900 flex-shrink-0">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm mb-0.5">Admin Account</h4>
                    <p className="text-xs text-gray-500 mb-2">admin@university.edu</p>
                    <ul className="text-xs text-gray-500 space-y-0.5">
                      <li>View system-wide dashboard</li>
                      <li>Monitor supervisor workloads</li>
                      <li>Manage proposal statuses</li>
                    </ul>
                  </div>
                </div>
              </button>
            </div>

            <p className="text-xs text-gray-500 pt-2">
              Passwords: <code className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-900">student123</code>,{' '}
              <code className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-900">supervisor123</code>,{' '}
              <code className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-900">admin123</code>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
