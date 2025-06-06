import LoginPage from './pages/LoginPage'
import CompetitionListPage from './pages/CompetitionListPage'
import CreateCompetition from './pages/CreateCompetition'
import ZoneListPage from './pages/ZoneListPage'
import RefereeInterface from './pages/RefereeInterface'
import LiveRankingPage from './pages/LiveRankingPage'
import ParticipantManagementPage from './pages/ParticipantManagementPage'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'

// Create a Material UI theme
const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f0f0f0',
    },
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
        
        <Route
          path="/competitions/:competitionId/live-ranking"
          element={
            <ProtectedRoute requireAuth={true}>
              <LiveRankingPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/competitions/:competitionId/participants"
          element={
            <ProtectedRoute requireAuth={true}>
              <ParticipantManagementPage />
            </ProtectedRoute>
          }
        />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
)
