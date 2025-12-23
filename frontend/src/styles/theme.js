// src/styles/theme.js
import { createTheme, alpha } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#5E35B1',
      light: '#7E57C2',
      dark: '#4527A0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00BFA6',
      light: '#1DE9B6',
      dark: '#00897B',
      contrastText: '#ffffff',
    },
    success: {
      main: '#00AB55',
      light: '#5BE584',
      dark: '#007B55',
    },
    info: {
      main: '#00B8D9',
      light: '#61F3F3',
      dark: '#006C9C',
    },
    warning: {
      main: '#FFAB00',
      light: '#FFD666',
      dark: '#B76E00',
    },
    error: {
      main: '#FF5630',
      light: '#FFAC82',
      dark: '#B71D18',
    },
    grey: {
      100: '#F9FAFB',
      200: '#F4F6F8',
      300: '#DFE3E8',
      400: '#C4CDD5',
      500: '#919EAB',
      600: '#637381',
      700: '#454F5B',
      800: '#212B36',
      900: '#161C24',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
      neutral: '#F4F6F8',
    },
    text: {
      primary: '#212B36',
      secondary: '#637381',
      disabled: '#919EAB',
    },
  },
  typography: {
    fontFamily: '"Public Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3.5rem',
      lineHeight: 1.25,
    },
    h2: {
      fontWeight: 700,
      fontSize: '3rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 700,
      fontSize: '2.25rem',
      lineHeight: 1.375,
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.75rem',
      lineHeight: 1.375,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.375,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.375,
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 0 2px 0 rgba(145, 158, 171, 0.08), 0 12px 24px -4px rgba(145, 158, 171, 0.08)',
    '0 0 2px 0 rgba(145, 158, 171, 0.08), 0 16px 32px -4px rgba(145, 158, 171, 0.08)',
    '0 0 2px 0 rgba(145, 158, 171, 0.08), 0 20px 40px -4px rgba(145, 158, 171, 0.08)',
    '0 0 2px 0 rgba(145, 158, 171, 0.08), 0 24px 48px 0 rgba(145, 158, 171, 0.08)',
    '0 0 8px 0 rgba(145, 158, 171, 0.08), 0 32px 56px 0 rgba(145, 158, 171, 0.08)',
    '0 0 8px 0 rgba(145, 158, 171, 0.08), 0 40px 64px 0 rgba(145, 158, 171, 0.08)',
    '0 0 8px 0 rgba(145, 158, 171, 0.08), 0 48px 80px 0 rgba(145, 158, 171, 0.08)',
    '0 0 8px 0 rgba(145, 158, 171, 0.08), 0 56px 88px 0 rgba(145, 158, 171, 0.08)',
    '0 0 16px 0 rgba(145, 158, 171, 0.08), 0 64px 96px 0 rgba(145, 158, 171, 0.08)',
    '0 0 16px 0 rgba(145, 158, 171, 0.08), 0 72px 104px 0 rgba(145, 158, 171, 0.08)',
    '0 0 16px 0 rgba(145, 158, 171, 0.08), 0 80px 112px 0 rgba(145, 158, 171, 0.08)',
    '0 0 16px 0 rgba(145, 158, 171, 0.08), 0 88px 120px 0 rgba(145, 158, 171, 0.08)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 16px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.08), 0 12px 24px -4px rgba(145, 158, 171, 0.08)',
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});