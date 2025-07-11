// src/routes/AppRoutes.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
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
import NotFound from "../pages/NotFound";

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
