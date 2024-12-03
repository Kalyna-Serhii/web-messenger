import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppRoutes from "./routes";

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App = () => {
  return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="App">
          <AppRoutes />
        </div>
      </ThemeProvider>
  );
};

export default App
