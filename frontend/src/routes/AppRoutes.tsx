// src/routes/AppRoutes.tsx
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";

/* Layouts */
import MainLayout from "../layouts/MainLayout";
import SettingsLayout from "../layouts/SettingsLayout";

/* Páginas públicas */
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";

/* Sección student */
import StudentDashboard from "../pages/student/StudentDashboard";
import Practice from "../pages/student/Practice";
import Roadmap from "../pages/student/Roadmap";
import StudentProfile from "../pages/student/Profile";
import Achievements from "../pages/student/Achievements";

/* Perfil genérico y ajustes */
import ProfileDashboard from "../pages/user/ProfileDashboard";
import Profile from "../pages/user/Profile";
import EditProfile from "../pages/user/EditProfile";
import ChangePassword from "../pages/user/ChangePassword";
import ThemeSettings from "../pages/user/ThemeSettings";

/* Protección y roles */
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import RoleRoute from "./RoleRoute";

/* Skeleton */
import LoadingScreen from "../components/LoadingScreen";

/* Lazy-load admin */
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const UserList = lazy(() => import("../pages/admin/UserList"));
const EditUser = lazy(() => import("../pages/admin/EditUser"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="student/dashboard" replace /> },

      /* --- Student --- */
      {
        path: "student",
        element: (
          <RoleRoute roles={["ROLE_STUDENT"]}>
            <Outlet />
          </RoleRoute>
        ),
        children: [
          { path: "dashboard", element: <StudentDashboard /> },

          /*  ⬇ nueva ruta con :objectiveId */
          { path: "practice/:objectiveId", element: <Practice /> },

          { path: "roadmap", element: <Roadmap /> },
          { path: "profile", element: <StudentProfile /> },
          { path: "achievements", element: <Achievements /> },
        ],
      },

      /* --- Perfil genérico --- */
      { path: "profile-dashboard", element: <ProfileDashboard /> },

      /* --- Configuración --- */
      {
        path: "settings",
        element: <SettingsLayout />,
        children: [
          { path: "profile", element: <Profile /> },
          { path: "edit-profile", element: <EditProfile /> },
          { path: "change-password", element: <ChangePassword /> },
          { path: "theme", element: <ThemeSettings /> },
        ],
      },

      /* --- Administración --- */
      {
        path: "admin",
        element: (
          <RoleRoute roles={["ROLE_ADMIN"]}>
            <Suspense fallback={<LoadingScreen />}>
              <AdminDashboard />
            </Suspense>
          </RoleRoute>
        ),
      },
      {
        path: "admin/users",
        element: (
          <RoleRoute roles={["ROLE_ADMIN"]}>
            <Suspense fallback={<LoadingScreen />}>
              <UserList />
            </Suspense>
          </RoleRoute>
        ),
      },
      {
        path: "admin/users/:id",
        element: (
          <RoleRoute roles={["ROLE_ADMIN"]}>
            <Suspense fallback={<LoadingScreen />}>
              <EditUser />
            </Suspense>
          </RoleRoute>
        ),
      },

      { path: "*", element: <NotFound /> },
    ],
  },

  /* Públicas */
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },

  { path: "*", element: <NotFound /> },
]);
