import LoginPage from './pages/LoginPage'
import CompetitionListPage from './pages/CompetitionListPage'
import RunRegistrationWrapper from './pages/RunRegistrationWrapper'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

export const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/competitions" element={<CompetitionListPage />} />
      <Route
        path="/competitions/:competitionId/participants/:dossard/run"
        element={<RunRegistrationWrapper />}
      />
    </Routes>
  </BrowserRouter>
)
