import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import AssessmentResult from './pages/AssessmentResult';
import Careers from './pages/Careers';
import CareerDetail from './pages/CareerDetail';
import Roadmaps from './pages/Roadmaps';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import Chatbot from './pages/Chatbot';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navigate to="/dashboard" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assessment"
                element={
                  <ProtectedRoute>
                    <Assessment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assessment/results"
                element={
                  <ProtectedRoute>
                    <AssessmentResult />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/careers"
                element={
                  <ProtectedRoute>
                    <Careers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/careers/:id"
                element={
                  <ProtectedRoute>
                    <CareerDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/roadmaps"
                element={
                  <ProtectedRoute>
                    <Roadmaps />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resume"
                element={
                  <ProtectedRoute>
                    <ResumeAnalyzer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <Chatbot />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
