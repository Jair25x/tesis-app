// src/routes/AppRoutes.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import MainLayout from "../layouts/MainLayout";
import SettingsLayout from "../layouts/SettingsLayout";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import EditProfile from "../pages/EditProfile";
import ChangePassword from "../pages/ChangePassword";
import ThemeSettings from "../pages/ThemeSettings"; // Theme settings page
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import RoleRoute from "./RoleRoute";
import NotFound from "../pages/NotFound";
import LoadingScreen from "../components/LoadingScreen";

const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const UserList = lazy(() => import("../pages/admin/UserList"));
const EditUser = lazy(() => import("../pages/admin/EditUser"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/settings",
        element: (
          <ProtectedRoute>
            <SettingsLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "profile",
            element: <Profile />,
          },
          {
            path: "edit-profile",
            element: <EditProfile />,
          },
          {
            path: "change-password",
            element: <ChangePassword />,
          },
          {
            path: "theme",
            element: <ThemeSettings />,
          },
        ],
      },
      {
        path: "/admin",
        element: (
          <RoleRoute roles={["ROLE_ADMIN"]}>
            <Suspense fallback={<LoadingScreen />}>
              <AdminDashboard />
            </Suspense>
          </RoleRoute>
        ),
      },
      {
        path: "/admin/users",
        element: (
          <RoleRoute roles={["ROLE_ADMIN"]}>
            <Suspense fallback={<LoadingScreen />}>
              <UserList />
            </Suspense>
          </RoleRoute>
        ),
      },
      {
        path: "/admin/users/:id",
        element: (
          <RoleRoute roles={["ROLE_ADMIN"]}>
            <Suspense fallback={<LoadingScreen />}>
              <EditUser />
            </Suspense>
          </RoleRoute>
        ),
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
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
]);
