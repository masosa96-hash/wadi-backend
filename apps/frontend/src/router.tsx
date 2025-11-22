import { createBrowserRouter, Navigate, type LoaderFunction } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { useOnboardingStore } from "./store/onboardingStore";
import RootGuard from "./components/RootGuard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import WorkspaceDetail from "./pages/WorkspaceDetail";
import Settings from "./pages/Settings";
import Favorites from "./pages/Favorites";
import Templates from "./pages/Templates";
import Workspaces from "./pages/Workspaces";
import Search from "./pages/Search";
import DebugPanel from "./pages/DebugPanel";
import AdminPanel from "./pages/AdminPanel";
import Onboarding from "./pages/Onboarding";
import { Billing } from "./pages/Billing";
import { WorkspaceSettings } from "./pages/WorkspaceSettings";
import { AIFlows } from "./pages/AIFlows";
import { Profile } from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { theme } from "./styles/theme";
import RootLayout from "./layouts/RootLayout";


// Root redirect component - sends users to appropriate page based on auth state
function RootRedirect() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: theme.colors.background.primary,
        color: theme.colors.text.primary,
        fontFamily: theme.typography.fontFamily.primary,
      }}>
        Loading...
      </div>
    );
  }

  // Redirect authenticated users to /home, unauthenticated to /login
  return <Navigate to={user ? "/home" : "/login"} replace />;
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <RootRedirect />,
      },
      {
        path: "/auth",
        element: <Navigate to="/login" replace />,
      },
      {
        path: "/login",
        element: (
          <RootGuard requireGuest>
            <Login />
          </RootGuard>
        ),
      },
      {
        path: "/register",
        element: (
          <RootGuard requireGuest>
            <Register />
          </RootGuard>
        ),
      },
      {
        path: "/forgot-password",
        element: (
          <RootGuard requireGuest>
            <ForgotPassword />
          </RootGuard>
        ),
      },
      {
        path: "/reset-password",
        element: (
          <RootGuard requireAuth>
            <ResetPassword />
          </RootGuard>
        ),
      },
      {
        path: "/home",
        element: (
          <RootGuard requireAuth>
            <Home />
          </RootGuard>
        ),
      },
      {
        path: "/chat",
        element: (
          <RootGuard requireAuth>
            <Chat />
          </RootGuard>
        ),
      },
      {
        path: "/projects",
        element: (
          <RootGuard requireAuth>
            <Projects />
          </RootGuard>
        ),
      },
      {
        path: "/projects/:id",
        element: (
          <RootGuard requireAuth>
            <ProjectDetail />
          </RootGuard>
        ),
      },
      {
        path: "/workspaces/:id",
        element: (
          <RootGuard requireAuth>
            <WorkspaceDetail />
          </RootGuard>
        ),
      },
      {
        path: "/billing",
        element: (
          <RootGuard requireAuth>
            <Billing />
          </RootGuard>
        ),
      },
      {
        path: "/workspace/settings",
        element: (
          <RootGuard requireAuth>
            <WorkspaceSettings />
          </RootGuard>
        ),
      },
      {
        path: "/presets",
        element: (
          <RootGuard requireAuth>
            <AIFlows />
          </RootGuard>
        ),
      },
      {
        path: "/profile",
        element: (
          <RootGuard requireAuth>
            <Profile />
          </RootGuard>
        ),
      },
      {
        path: "/settings",
        element: (
          <RootGuard requireAuth>
            <Settings />
          </RootGuard>
        ),
      },
      {
        path: "/favorites",
        element: (
          <RootGuard requireAuth>
            <Favorites />
          </RootGuard>
        ),
      },
      {
        path: "/templates",
        element: (
          <RootGuard requireAuth>
            <Templates />
          </RootGuard>
        ),
      },
      {
        path: "/workspaces",
        element: (
          <RootGuard requireAuth>
            <Workspaces />
          </RootGuard>
        ),
      },
      {
        path: "/search",
        element: (
          <RootGuard requireAuth>
            <Search />
          </RootGuard>
        ),
      },
      {
        path: "/debug",
        element: (
          <RootGuard requireAuth>
            <DebugPanel />
          </RootGuard>
        ),
      },
      {
        path: "/admin",
        element: (
          <RootGuard requireAuth>
            <AdminPanel />
          </RootGuard>
        ),
      },
      {
        path: "/onboarding",
        element: (
          <RootGuard requireAuth>
            <Onboarding />
          </RootGuard>
        ),
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

