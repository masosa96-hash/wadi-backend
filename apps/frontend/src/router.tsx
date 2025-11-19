import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import RootGuard from "./components/RootGuard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import { theme } from "./styles/theme";

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

  // Redirect authenticated users to /projects, unauthenticated to /login
  return <Navigate to={user ? "/projects" : "/login"} replace />;
}

export const router = createBrowserRouter([
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
]);
