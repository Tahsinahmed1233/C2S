import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import WorkerRecognition from './components/WorkerRecognition';
import WorkerPerformance from './components/WorkerPerformance';
import Attendance from './components/Attendance';
import ProductionLine from './components/ProductionLine';
import JobSequencing from './components/JobSequencing';
import Inventory from './components/Inventory';
import QualityControl from './components/QualityControl';
import WasteTracking from './components/WasteTracking';
import MachineMaintenance from './components/MachineMaintenance';
import WorkerReporting from './components/WorkerReporting';
import AIInsights from './components/AIInsights';
import ReportsCompliance from './components/ReportsCompliance';
import Chats from './components/Chats';
import Settings from './components/Settings';
import './App.css';

function App() {
  // Check if user is authenticated
  const isAuthenticated = () => {
    return localStorage.getItem('user') !== null;
  };

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rewards"
          element={
            <ProtectedRoute>
              <WorkerRecognition />
            </ProtectedRoute>
          }
        />

        <Route
          path="/performance"
          element={
            <ProtectedRoute>
              <WorkerPerformance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <Attendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/production"
          element={
            <ProtectedRoute>
              <ProductionLine />
            </ProtectedRoute>
          }
        />

        <Route
          path="/job-sequencing"
          element={
            <ProtectedRoute>
              <JobSequencing />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quality-control"
          element={
            <ProtectedRoute>
              <QualityControl />
            </ProtectedRoute>
          }
        />

        <Route
          path="/waste"
          element={
            <ProtectedRoute>
              <WasteTracking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/machines"
          element={
            <ProtectedRoute>
              <MachineMaintenance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/safety"
          element={
            <ProtectedRoute>
              <WorkerReporting />
            </ProtectedRoute>
          }
        />

        <Route
          path="/worker-reporting"
          element={
            <ProtectedRoute>
              <WorkerReporting />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai-insights"
          element={
            <ProtectedRoute>
              <AIInsights />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsCompliance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chats"
          element={
            <ProtectedRoute>
              <Chats />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
