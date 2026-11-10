import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SkillsPage from "./pages/SkillsPage.jsx";
import BrowseProjects from "./pages/BrowseProjects.jsx";
import CreateProject from "./pages/CreateProject.jsx";
import ProjectDetails from "./pages/ProjectDetails.jsx";
import TeamManagement from "./pages/TeamManagement.jsx";
import MyInvitationsRequests from "./pages/MyInvitationsRequests.jsx";
import TeamJoinRequests from "./pages/TeamJoinRequests.jsx";
import TeamInvitations from "./pages/TeamInvitations.jsx";
import MyProfile from "./pages/MyProfile.jsx";
import StudentDirectory from "./pages/StudentDirectory.jsx";
import StudentProfile from "./pages/StudentProfile.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppLayout from "./components/AppLayout.jsx";

import "./App.css";

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading" role="status">
        <span className="app-spinner" aria-hidden="true" />
        Loading SkillSync...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
      />

      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      {/* Every signed-in page shares one sidebar + topbar */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/students" element={<StudentDirectory />} />
        <Route path="/students/:studentId" element={<StudentProfile />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/projects" element={<BrowseProjects />} />
        <Route path="/projects/create" element={<CreateProject />} />
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
        <Route path="/my-activity" element={<MyInvitationsRequests />} />
        <Route path="/teams/:teamId" element={<TeamManagement />} />
        <Route path="/teams/:teamId/requests" element={<TeamJoinRequests />} />
        <Route path="/teams/:teamId/invitations" element={<TeamInvitations />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
