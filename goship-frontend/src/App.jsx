import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Tariff from './pages/Tariff';
import Tracking from './pages/Tracking';
import Dashboard from './pages/Dashboard';
import Courier from './pages/Courier';
import Area from './pages/Area';
import Manifest from './pages/Manifest';
import Analytics from './pages/Analytics';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tariff" element={<Tariff />} />
          <Route path="/tracking" element={<Tracking />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/courier"
            element={
              <ProtectedRoute>
                <Courier />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/area"
            element={
              <ProtectedRoute>
                <Area />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/manifest"
            element={
              <ProtectedRoute>
                <Manifest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

