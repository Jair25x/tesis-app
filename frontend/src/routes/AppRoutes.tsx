// src/routes/AppRoutes.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { Suspense } from "react";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

import MainLayout from "../layouts/MainLayout";
import MinimalLayout from "../layouts/MinimalLayout";
import SettingsLayout from "../layouts/SettingsLayout";

import LoadingScreen from "../components/LoadingScreen";

// Rutas separadas
import { adminRoute } from "./admin";
import { studentRoute } from "./student";
import { teacherRoute } from "./teacher";

// Páginas públicas
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";

// Páginas de usuario (settings)
import Profile from "../pages/user/Profile";
import EditProfile from "../pages/user/EditProfile";
import ChangePassword from "../pages/user/ChangePassword";
import ThemeSettings from "../pages/user/ThemeSettings";

// Perfil dashboard (si tienes enlaces externos que apuntan aquí)
import ProfileDashboard from "../pages/user/ProfileDashboard";

// Player sin sidebar
import ExercisePlayerByHierarchy from "../pages/student/ExercisePlayerByHierarchy";

import { CurriculumProvider } from "../context/CurriculumProvider";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <CurriculumProvider>
          <MainLayout />
        </CurriculumProvider>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="student/dashboard" replace /> },

      // Módulos
      studentRoute,
      teacherRoute,
      adminRoute,

      // Perfil / ajustes
      // Ruta histórica por compatibilidad si ya tienes enlaces viejos
      { path: "profile-dashboard", element: <ProfileDashboard /> },

      {
        path: "settings",
        element: <SettingsLayout />,
        children: [
          // Redirección por si acceden a /settings
          { index: true, element: <Navigate to="profile" replace /> },

          // 👇 Estas cuatro rutas son las que tu menú muestra
          { path: "profile", element: <Profile /> },
          { path: "edit-profile", element: <EditProfile /> },
          { path: "change-password", element: <ChangePassword /> },
          {
            path: "theme",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <ThemeSettings />
              </Suspense>
            ),
          },

          // Cualquier otra subruta de settings → 404
          { path: "*", element: <NotFound /> },
        ],
      },

      // 404 dentro del layout
      { path: "*", element: <NotFound /> },
    ],
  },

  // Player sin sidebar
  {
    path: "/student/exercises/:curriculumId/:competencyId/:standardId/:learningObjectiveId/:exerciseId",
    element: (
      <ProtectedRoute>
        <MinimalLayout>
          <ExercisePlayerByHierarchy />
        </MinimalLayout>
      </ProtectedRoute>
    ),
  },

  // Públicas
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

  // 404 global fuera del layout protegido
  { path: "*", element: <NotFound /> },
]);
