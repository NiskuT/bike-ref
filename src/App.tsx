import LoginPage from './pages/LoginPage'
import CompetitionListPage from './pages/CompetitionListPage'
import CreateCompetition from './pages/CreateCompetition'
import ZoneListPage from './pages/ZoneListPage'
import RefereeInterface from './pages/RefereeInterface'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'

// Create a Material UI theme
const theme = createTheme({
  palette: {
    mode: 'light',
  },
  typography: {
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
})

export const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/competitions" replace />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route 
            path="/competitions" 
            element={
              <ProtectedRoute requireAuth={true}>
                <CompetitionListPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/new-competition" 
            element={
              <ProtectedRoute requireAuth={true} requireCreateCompetition={true}>
                <CreateCompetition />
              </ProtectedRoute>
            } 
          />
          
          <Route
            path="/competitions/:competitionId/zones"
            element={
              <ProtectedRoute requireAuth={true}>
                <ZoneListPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/competitions/:competitionId/referee"
            element={
              <ProtectedRoute requireAuth={true}>
                <RefereeInterface />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
)
