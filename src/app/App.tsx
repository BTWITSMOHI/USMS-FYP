import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { LoginPage } from '@/app/components/LoginPage';
import { StudentDashboard } from '@/app/components/StudentDashboard';
import { SupervisorDashboard } from '@/app/components/SupervisorDashboard';
import { AdminDashboard } from '@/app/components/AdminDashboard';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { theme } from '@/theme';

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'supervisor':
      return <SupervisorDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <LoginPage />;
  }
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider 
        maxSnack={3} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={4000}
      >
        <AuthProvider>
          <DataProvider>
            <AppContent />
          </DataProvider>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
