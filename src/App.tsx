import LoginPage from './pages/LoginPage'
import CompetitionListPage from './pages/CompetitionListPage'
import RunRegistrationWrapper from './pages/RunRegistrationWrapper'
import CreateCompetition from './pages/CreateCompetition'
import ZoneListPage from './pages/ZoneListPage'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'

export const App = () => (
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
          path="/competitions/:competitionId/participants/:dossard/run"
          element={
            <ProtectedRoute requireAuth={true}>
              <RunRegistrationWrapper />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
)
