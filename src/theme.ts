import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb', // Blue-600
      light: '#3b82f6', // Blue-500
      dark: '#1d4ed8', // Blue-700
    },
    secondary: {
      main: '#64748b', // Slate-500
      light: '#94a3b8', // Slate-400
      dark: '#475569', // Slate-600
    },
    error: {
      main: '#dc2626', // Red-600
    },
    warning: {
      main: '#f59e0b', // Amber-500
    },
    success: {
      main: '#16a34a', // Green-600
    },
    background: {
      default: '#f8fafc', // Slate-50
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
      },
    },
  },
});
