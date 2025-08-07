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

/* Objetivos de Aprendizaje */
const LearningObjectiveList = lazy(
  () => import("../pages/admin/learning-objectives/LearningObjectiveList")
);
const LearningObjectiveForm = lazy(
  () => import("../pages/admin/learning-objectives/LearningObjectiveForm")
);
const LearningObjectiveDetails = lazy(
  () => import("../pages/admin/learning-objectives/LearningObjectiveDetails")
);

const ExerciseList = lazy(() => import("../pages/admin/exercise/ExerciseList"));
const ExerciseForm = lazy(() => import("../pages/admin/exercise/ExerciseForm"));
const ExerciseDetails = lazy(
  () => import("../pages/admin/exercise/ExerciseDetails")
);

/* Pistas */
const HintList = lazy(() => import("../pages/admin/hints/HintList"));
const HintForm = lazy(() => import("../pages/admin/hints/HintForm"));
const HintDetails = lazy(() => import("../pages/admin/hints/HintDetails"));

/* Pasos de solucion */
const SolutionStepList = lazy(
  () => import("../pages/admin/solutionStep/SolutionStepList")
);
const SolutionStepForm = lazy(
  () => import("../pages/admin/solutionStep/SolutionStepForm")
);
const SolutionStepDetails = lazy(
  () => import("../pages/admin/solutionStep/SolutionStepDetails")
);

/* Test de Inicio */
const DiagnosticTest = lazy(() => import("../pages/student/DiagnosticTest"));

/* Explorador Curricular */
import ExplorerDashboard from "../pages/admin/explorer/ExplorerDashboard";
import { ExplorerProvider } from "../pages/admin/explorer/ExplorerProvider";

/* Context Providers */
import { StandardProvider } from "../context/StandardProvider";
import { CompetencyProvider } from "../context/CompetencyProvider";
import { LearningObjectiveProvider } from "../context/LearningObjectiveProvider";
import { ExerciseProvider } from "../context/ExerciseProvider";
import { HintProvider } from "../context/HintProvider";
import { SolutionStepProvider } from "../context/SolutionStepProvider";

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

      // Estudiante
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

          // ✅ Nueva ruta para el test diagnóstico
          {
            path: "diagnostic",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <DiagnosticTest />
              </Suspense>
            ),
          },
        ],
      },

      // Perfil general
      { path: "profile-dashboard", element: <ProfileDashboard /> },

      // Configuración
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

      // Administración
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

          {
            path: "explorer",
            element: (
              <ExplorerProvider>
                <ExplorerDashboard />
              </ExplorerProvider>
            ),
          },

          // Usuarios
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

          // Currículos
          { path: "curricula", element: <CurriculumList /> },
          { path: "curricula/new", element: <CurriculumForm /> },
          { path: "curricula/:id/edit", element: <CurriculumForm /> },
          { path: "curricula/:id/details", element: <CurriculumDetails /> },

          // Competencias
          {
            path: "curricula/:curriculumId/competencies",
            element: (
              <CompetencyProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <CompetencyList />
                </Suspense>
              </CompetencyProvider>
            ),
          },
          {
            path: "curricula/:curriculumId/competencies/new",
            element: (
              <CompetencyProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <CompetencyForm />
                </Suspense>
              </CompetencyProvider>
            ),
          },
          {
            path: "curricula/:curriculumId/competencies/:competencyId/edit",
            element: (
              <CompetencyProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <CompetencyForm />
                </Suspense>
              </CompetencyProvider>
            ),
          },
          {
            path: "curricula/:curriculumId/competencies/:competencyId/details",
            element: (
              <CompetencyProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <CompetencyDetails />
                </Suspense>
              </CompetencyProvider>
            ),
          },

          // Estándares
          {
            path: "curricula/:curriculumId/competencies/:competencyId/standards",
            element: (
              <StandardProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <StandardList />
                </Suspense>
              </StandardProvider>
            ),
          },
          {
            path: "curricula/:curriculumId/competencies/:competencyId/standards/new",
            element: (
              <StandardProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <StandardForm />
                </Suspense>
              </StandardProvider>
            ),
          },
          {
            path: "curricula/:curriculumId/competencies/:competencyId/standards/:standardId/edit",
            element: (
              <StandardProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <StandardForm />
                </Suspense>
              </StandardProvider>
            ),
          },
          {
            path: "curricula/:curriculumId/competencies/:competencyId/standards/:standardId/details",
            element: (
              <StandardProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <StandardDetails />
                </Suspense>
              </StandardProvider>
            ),
          },

          // Objetivos de aprendizaje
          {
            path: "curricula/:curriculumId/competencies/:competencyId/standards/:standardId/learning-objectives",
            element: (
              <LearningObjectiveProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <LearningObjectiveList />
                </Suspense>
              </LearningObjectiveProvider>
            ),
          },
          {
            path: "curricula/:curriculumId/competencies/:competencyId/standards/:standardId/learning-objectives/new",
            element: (
              <LearningObjectiveProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <LearningObjectiveForm />
                </Suspense>
              </LearningObjectiveProvider>
            ),
          },
          {
            path: "curricula/:curriculumId/competencies/:competencyId/standards/:standardId/learning-objectives/:learningObjectiveId/edit",
            element: (
              <LearningObjectiveProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <LearningObjectiveForm />
                </Suspense>
              </LearningObjectiveProvider>
            ),
          },
          {
            path: "curricula/:curriculumId/competencies/:competencyId/standards/:standardId/learning-objectives/:learningObjectiveId/details",
            element: (
              <LearningObjectiveProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <LearningObjectiveDetails />
                </Suspense>
              </LearningObjectiveProvider>
            ),
          },

          // Ejercicios
          {
            path: "curricula/:curriculumId/competencies/:competencyId/standards/:standardId/learning-objectives/:learningObjectiveId/exercises",
            element: (
              <ExerciseProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <ExerciseList />
                </Suspense>
              </ExerciseProvider>
            ),
          },
          {
            path: "curricula/:curriculumId/competencies/:competencyId/standards/:standardId/learning-objectives/:learningObjectiveId/exercises/new",
            element: (
              <ExerciseProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <ExerciseForm />
                </Suspense>
              </ExerciseProvider>
            ),
          },
          {
            path: "curricula/:curriculumId/competencies/:competencyId/standards/:standardId/learning-objectives/:learningObjectiveId/exercises/:exerciseId/edit",
            element: (
              <ExerciseProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <ExerciseForm />
                </Suspense>
              </ExerciseProvider>
            ),
          },
          {
            path: "curricula/:curriculumId/competencies/:competencyId/standards/:standardId/learning-objectives/:learningObjectiveId/exercises/:exerciseId/details",
            element: (
              <ExerciseProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <ExerciseDetails />
                </Suspense>
              </ExerciseProvider>
            ),
          },
          // Pistas
          {
            path: "curricula/:curriculumId/competencies/:competencyId/standards/:standardId/learning-objectives/:learningObjectiveId/exercises/:exerciseId/hints",
            element: (
              <HintProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <HintList />
                </Suspense>
              </HintProvider>
            ),
          },
          {
            path: "curricula/:curriculumId/competencies/:competencyId/standards/:standardId/learning-objectives/:learningObjectiveId/exercises/:exerciseId/hints/new",
            element: (
              <HintProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <HintForm />
                </Suspense>
              </HintProvider>
            ),
          },
          {
            path: "curricula/:curriculumId/competencies/:competencyId/standards/:standardId/learning-objectives/:learningObjectiveId/exercises/:exerciseId/hints/:hintId/edit",
            element: (
              <HintProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <HintForm />
                </Suspense>
              </HintProvider>
            ),
          },
          {
            path: "curricula/:curriculumId/competencies/:competencyId/standards/:standardId/learning-objectives/:learningObjectiveId/exercises/:exerciseId/hints/:hintId/details",
            element: (
              <HintProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <HintDetails />
                </Suspense>
              </HintProvider>
            ),
          },
          // Solution Steps
          {
            path: "curricula/:curriculumId/competencies/:competencyId/standards/:standardId/learning-objectives/:learningObjectiveId/exercises/:exerciseId/solution-steps",
            element: (
              <SolutionStepProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <SolutionStepList />
                </Suspense>
              </SolutionStepProvider>
            ),
          },
          {
            path: "curricula/:curriculumId/competencies/:competencyId/standards/:standardId/learning-objectives/:learningObjectiveId/exercises/:exerciseId/solution-steps/new",
            element: (
              <SolutionStepProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <SolutionStepForm />
                </Suspense>
              </SolutionStepProvider>
            ),
          },
          {
            path: "curricula/:curriculumId/competencies/:competencyId/standards/:standardId/learning-objectives/:learningObjectiveId/exercises/:exerciseId/solution-steps/:solutionStepId/edit",
            element: (
              <SolutionStepProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <SolutionStepForm />
                </Suspense>
              </SolutionStepProvider>
            ),
          },
          {
            path: "curricula/:curriculumId/competencies/:competencyId/standards/:standardId/learning-objectives/:learningObjectiveId/exercises/:exerciseId/solution-steps/:solutionStepId/details",
            element: (
              <SolutionStepProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <SolutionStepDetails />
                </Suspense>
              </SolutionStepProvider>
            ),
          },
        ],
      },

      { path: "*", element: <NotFound /> },
    ],
  },

  // Rutas públicas
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
