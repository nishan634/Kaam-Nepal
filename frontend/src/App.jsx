import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { ModeProvider } from './context/ModeContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import FindJobs from './pages/FindJobs'
import JobDetail from './pages/JobDetail'
import FreelanceGigs from './pages/FreelanceGigs'
import GigDetail from './pages/GigDetail'
import PostGig from './pages/PostGig'
import EmployerHub from './pages/EmployerHub'
import MyApplications from './pages/MyApplications'
import PostJob from './pages/PostJob'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ModeProvider>
          <AuthProvider>
          <div className="min-h-screen flex flex-col bg-surface">
          <Navbar />
          <main className="flex-1 w-full pt-20">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/find-jobs" element={<FindJobs />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/freelance" element={<FreelanceGigs />} />
              <Route path="/gigs/:id" element={<GigDetail />} />
              <Route
                path="/freelance/new"
                element={
                  <ProtectedRoute role="jobseeker">
                    <PostGig />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/hub"
                element={
                  <ProtectedRoute role="employer">
                    <EmployerHub />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-applications"
                element={
                  <ProtectedRoute role="jobseeker">
                    <MyApplications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/post-job"
                element={
                  <ProtectedRoute role="employer">
                    <PostJob />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
          <Footer />
          </div>
          </AuthProvider>
        </ModeProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}
