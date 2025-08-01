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
const UserList = lazy(() => import("../pages/admin/users/UserList"));
const EditUser = lazy(() => import("../pages/admin/users/EditUser"));

/* Competencias */
const CompetencyList = lazy(
  () => import("../pages/admin/competencies/CompetencyList")
);
const CompetencyForm = lazy(
  () => import("../pages/admin/competencies/CompetencyForm")
);
const CompetencyDetails = lazy(
  () => import("../pages/admin/competencies/CompetencyDetails")
);

/* Currículos */
const CurriculumList = lazy(
  () => import("../pages/admin/curricula/CurriculumList")
);
const CurriculumForm = lazy(
  () => import("../pages/admin/curricula/CurriculumForm")
);
const CurriculumDetails = lazy(
  () => import("../pages/admin/curricula/CurriculumDetails")
);

/* Estándares */
const StandardList = lazy(
  () => import("../pages/admin/standards/StandardList")
);
const StandardForm = lazy(
  () => import("../pages/admin/standards/StandardForm")
);
const StandardDetails = lazy(
  () => import("../pages/admin/standards/StandardDetails")
);

/* Explorador Curricular */
import ExplorerDashboard from "../pages/admin/explorer/ExplorerDashboard";
import { ExplorerProvider } from "../pages/admin/explorer/ExplorerProvider";

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
          {
            path: "practice/:curriculumId/:competencyId/:standardId/:learningObjectiveId",
            element: <Practice />,
          },
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
            <MainLayout />
          </RoleRoute>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <AdminDashboard />
              </Suspense>
            ),
          },

          // 🧭 Explorador Curricular
          {
            path: "explorer",
            element: (
              <ExplorerProvider>
                <ExplorerDashboard />
              </ExplorerProvider>
            ),
          },

          /* Usuarios */
          {
            path: "users",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <UserList />
              </Suspense>
            ),
          },
          {
            path: "users/:id",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <EditUser />
              </Suspense>
            ),
          },

          /* Currículos */
          { path: "curricula", element: <CurriculumList /> },
          { path: "curricula/new", element: <CurriculumForm /> },
          { path: "curricula/:id/edit", element: <CurriculumForm /> },
          { path: "curricula/:id/details", element: <CurriculumDetails /> },

          /* Competencias */
          {
            path: "curricula/:curriculumId/competencies",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <CompetencyList />
              </Suspense>
            ),
          },
          {
            path: "curricula/:curriculumId/competencies/new",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <CompetencyForm />
              </Suspense>
            ),
          },
          {
            path: "curricula/:curriculumId/competencies/:competencyId/edit",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <CompetencyForm />
              </Suspense>
            ),
          },
          {
            path: "curricula/:curriculumId/competencies/:competencyId/details",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <CompetencyDetails />
              </Suspense>
            ),
          },

          /* Estándares */
          {
            path: "curricula/:curriculumId/competencies/:competencyId/standards",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <StandardList />
              </Suspense>
            ),
          },
          {
            path: "curricula/:curriculumId/competencies/:competencyId/standards/new",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <StandardForm />
              </Suspense>
            ),
          },
          {
            path: "curricula/:curriculumId/competencies/:competencyId/standards/:standardId/edit",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <StandardForm />
              </Suspense>
            ),
          },
          {
            path: "curricula/:curriculumId/competencies/:competencyId/standards/:standardId/details",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <StandardDetails />
              </Suspense>
            ),
          },
        ],
      },

      { path: "*", element: <NotFound /> },
    ],
  },

  /* Rutas públicas */
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
