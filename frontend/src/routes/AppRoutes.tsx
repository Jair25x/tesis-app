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

// Perfil general
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
      { path: "profile-dashboard", element: <ProfileDashboard /> },
      {
        path: "settings",
        element: <SettingsLayout />,
        children: [
          { path: "profile", element: <ProfileDashboard /> }, // o tu componente de edición si prefieres
          {
            path: "theme",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <div />
              </Suspense>
            ),
          }, // ya tienes ThemeSettings si quieres importarlo aquí
          { path: "*", element: <NotFound /> },
        ],
      },

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

  { path: "*", element: <NotFound /> },
]);
