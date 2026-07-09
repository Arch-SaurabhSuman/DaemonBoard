import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardLayout } from '../layouts/DashboardLayout';

import {
  Dashboard,
  Roadmaps,
  Kanban,
  Notes,
  Monitor,
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  VerifyEmail,
  AuditLogs
} from '../pages';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Protected Main Application Layout Pages */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="roadmaps" element={<Roadmaps />} />
        <Route path="kanban" element={<Kanban />} />
        <Route path="notes" element={<Notes />} />
        <Route path="monitor" element={<Monitor />} />
        <Route path="admin/audit-logs" element={<AuditLogs />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
