import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LinkedInLogin from './components/Auth/LinkedInLogin';
import ProfileForm from './components/Profile/ProfileForm';
import ProfilePicture from './components/Profile/ProfilePicture';
import IDUpload from './components/Verification/IDUpload';
import VerificationStatus from './components/Verification/VerificationStatus';
import CallbackHandler from './components/CallbackHandler';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LinkedInLogin />} />
          <Route path="/auth/callback" element={<CallbackHandler />} />
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/profile" replace />} />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfileForm />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/verification"
                    element={
                      <ProtectedRoute>
                        <IDUpload />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile-picture"
                    element={
                      <ProtectedRoute>
                        <ProfilePicture />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/status"
                    element={
                      <ProtectedRoute>
                        <VerificationStatus />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
