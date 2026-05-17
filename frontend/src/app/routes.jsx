import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "../layouts/AppLayout.jsx";
import { LoginPage } from "../pages/LoginPage.jsx";
import { DashboardPage } from "../pages/DashboardPage.jsx";
import { BoardsPage } from "../pages/BoardsPage.jsx";
import { BoardDetailPage } from "../pages/BoardDetailPage.jsx";
import { MyTasksPage } from "../pages/MyTasksPage.jsx";
import MessagesPage from "../pages/MessagesPage.jsx";
import NotificationsPage from "../pages/NotificationsPage.jsx";
import { TeamPage } from "../pages/TeamPage.jsx";
import { SettingsPage } from "../pages/SettingsPage.jsx";
import { NotFoundPage } from "../pages/NotFoundPage.jsx";
import { WorkspacesPage } from "../pages/WorkspacesPage.jsx";
import { WorkspaceDetailPage } from "../pages/WorkspaceDetailPage.jsx";

import { LandingPage } from "../pages/LandingPage.jsx";

import { getToken } from "../services/authService.js";

function ProtectedRoute({ children }) {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const token = getToken();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/boards" element={<BoardsPage />} />
        <Route path="/boards/:boardId" element={<BoardDetailPage />} />
        <Route path="/tasks" element={<MyTasksPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/workspaces" element={<WorkspacesPage />} />
        <Route
          path="/workspaces/:workspaceId"
          element={<WorkspaceDetailPage />}
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}