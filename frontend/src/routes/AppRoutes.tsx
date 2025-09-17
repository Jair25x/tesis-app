// src/routes/AppRoutes.tsx
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";

/* ╔═════════════════════════════════════════════╗
   ║                   LAYOUTS                   ║
   ╚═════════════════════════════════════════════╝ */
import MainLayout from "../layouts/MainLayout";
import SettingsLayout from "../layouts/SettingsLayout";
import MinimalLayout from "../layouts/MinimalLayout";

/* ╔═════════════════════════════════════════════╗
   ║                 RUTAS PÚBLICAS              ║
   ╚═════════════════════════════════════════════╝ */
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";

/* ╔═════════════════════════════════════════════╗
   ║               STUDENT (núcleo)              ║
   ╚═════════════════════════════════════════════╝ */
import StudentDashboard from "../pages/student/StudentDashboard";
import Practice from "../pages/student/Practice";
import Roadmap from "../pages/student/Roadmap";
import StudentProfile from "../pages/student/Profile";
import Achievements from "../pages/student/Achievements";

/* ╔═════════════════════════════════════════════╗
   ║            PERFIL / AJUSTES (usuario)       ║
   ╚═════════════════════════════════════════════╝ */
import ProfileDashboard from "../pages/user/ProfileDashboard";
import Profile from "../pages/user/Profile";
import EditProfile from "../pages/user/EditProfile";
import ChangePassword from "../pages/user/ChangePassword";
import ThemeSettings from "../pages/user/ThemeSettings";

/* ╔═════════════════════════════════════════════╗
   ║                 GUARDS / ROUTES             ║
   ╚═════════════════════════════════════════════╝ */
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import RoleRoute from "./RoleRoute";

/* ╔═════════════════════════════════════════════╗
   ║                SKELETON / LOADING           ║
   ╚═════════════════════════════════════════════╝ */
import LoadingScreen from "../components/LoadingScreen";

/* ╔═════════════════════════════════════════════╗
   ║                 ADMIN (lazy)                ║
   ╚═════════════════════════════════════════════╝ */
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

/* Objetivos de aprendizaje */
const LearningObjectiveList = lazy(
  () => import("../pages/admin/learning-objectives/LearningObjectiveList")
);
const LearningObjectiveForm = lazy(
  () => import("../pages/admin/learning-objectives/LearningObjectiveForm")
);
const LearningObjectiveDetails = lazy(
  () => import("../pages/admin/learning-objectives/LearningObjectiveDetails")
);

/* Ejercicios */
const ExerciseList = lazy(() => import("../pages/admin/exercise/ExerciseList"));
const ExerciseForm = lazy(() => import("../pages/admin/exercise/ExerciseForm"));
const ExerciseDetails = lazy(
  () => import("../pages/admin/exercise/ExerciseDetails")
);

/* Pistas */
const HintList = lazy(() => import("../pages/admin/hints/HintList"));
const HintForm = lazy(() => import("../pages/admin/hints/HintForm"));
const HintDetails = lazy(() => import("../pages/admin/hints/HintDetails"));

/* Pasos de solución */
const SolutionStepList = lazy(
  () => import("../pages/admin/solutionStep/SolutionStepList")
);
const SolutionStepForm = lazy(
  () => import("../pages/admin/solutionStep/SolutionStepForm")
);
const SolutionStepDetails = lazy(
  () => import("../pages/admin/solutionStep/SolutionStepDetails")
);

/* Explorador Curricular (no lazy) */
import ExplorerDashboard from "../pages/admin/explorer/ExplorerDashboard";
import { ExplorerProvider } from "../pages/admin/explorer/ExplorerProvider";

/* ╔═════════════════════════════════════════════╗
   ║                  PROVIDERS                  ║
   ╚═════════════════════════════════════════════╝ */
import { StandardProvider } from "../context/StandardProvider";
import { CompetencyProvider } from "../context/CompetencyProvider";
import { LearningObjectiveProvider } from "../context/LearningObjectiveProvider";
import { ExerciseProvider } from "../context/ExerciseProvider";
import { HintProvider } from "../context/HintProvider";
import { SolutionStepProvider } from "../context/SolutionStepProvider";
import { CurriculumProvider } from "../context/CurriculumProvider";

/* ╔═════════════════════════════════════════════╗
   ║               STUDENT (extras)              ║
   ╚═════════════════════════════════════════════╝ */
import ExercisePlayerByHierarchy from "../pages/student/ExercisePlayerByHierarchy";
import RoadmapLauncher from "../pages/student/RoadmapLauncher";

/* ╔═════════════════════════════════════════════╗
   ║             TEACHER (dashboard)             ║
   ╚═════════════════════════════════════════════╝ */
const TeacherDashboard = lazy(
  () => import("../pages/teacher/TeacherDashboard")
);

/* Teacher: aulas */
const TeacherClassrooms = lazy(() => import("../pages/teacher/Classrooms"));
const TeacherClassroomDetail = lazy(
  () => import("../pages/teacher/ClassroomDetail")
);
const ClassroomStudentDetailPage = lazy(
  () => import("../pages/teacher/ClassroomStudentDetailPage")
);

/* Student: aulas */
const StudentClassrooms = lazy(
  () => import("../pages/student/StudentClassroomsPage")
);
const JoinClassroom = lazy(() => import("../pages/student/JoinClassroomPage"));

/* ╔═════════════════════════════════════════════╗
   ║             ASSESSMENTS (Student)           ║
   ╚═════════════════════════════════════════════╝ */
const AvailableAssignments = lazy(
  () => import("../pages/student/assessments/AvailableAssignments")
);
const TakeAssessment = lazy(
  () => import("../pages/student/assessments/TakeAssessment")
);
const SubmissionResult = lazy(
  () => import("../pages/student/assessments/SubmissionResult")
); // ✅ NUEVO
const StudentHistory = lazy(
  () => import("../pages/student/assessments/History")
);
/* ╔═════════════════════════════════════════════╗
   ║              ASSESSMENTS (Teacher)          ║
   ╚═════════════════════════════════════════════╝ */
const AssignmentsList = lazy(
  () => import("../pages/teacher/assessments/AssignmentsList")
);
const AssignmentSubmissionsList = lazy(
  () => import("../pages/teacher/assessments/AssignmentSubmissionsList")
);
import AssignmentOverview from "../pages/teacher/assessments/AssignmentOverview";
import SubmissionDetailTeacher from "../pages/teacher/assessments/SubmissionDetailTeacher";
import AdminAssignmentsList from "../pages/admin/assessments/AdminAssignmentsList";
/* ╔═════════════════════════════════════════════╗
   ║          ADMIN: herramientas/authoring      ║
   ╚═════════════════════════════════════════════╝ */
import AdminAssessmentTools from "../pages/admin/assessments/AdminAssessmentTools";
import TemplateForm from "../pages/admin/assessments/TemplateForm";
import AssignmentForm from "../pages/admin/assessments/AssignmentForm";
import TemplatesList from "../pages/admin/assessments/TemplatesList";

/* ╔═════════════════════════════════════════════╗
   ║          IA: utilidades de IA               ║
   ╚═════════════════════════════════════════════╝ */
import AdvisorChat from "../pages/student/ai/AdvisorChat";
const AdminAdvisorChat = lazy(
  () => import("../pages/admin/ai/AdminAdvisorChat")
);

/* ╔═════════════════════════════════════════════╗
   ║                  DEFINICIÓN ROUTER          ║
   ╚═════════════════════════════════════════════╝ */
export const router = createBrowserRouter([
  /* ╔══════════════════════╗
     ║   BLOQUE PRINCIPAL   ║  (con sidebar / MainLayout)
     ╚══════════════════════╝ */
  {
    path: "/",
    element: (
      <ProtectedRoute>
        {/* Montamos providers globales que necesitan estar alrededor del layout */}
        <CurriculumProvider>
          <MainLayout />
        </CurriculumProvider>
      </ProtectedRoute>
    ),
    children: [
      /* Redirección a dashboard de estudiante por defecto */
      { index: true, element: <Navigate to="student/dashboard" replace /> },

      /* ──────────────────────── STUDENT ──────────────────────── */
      {
        path: "student",
        element: (
          <RoleRoute roles={["ROLE_STUDENT"]}>
            <Outlet />
          </RoleRoute>
        ),
        children: [
          { path: "dashboard", element: <StudentDashboard /> },
          // Ia chat
          { path: "ai-advisor", element: <AdvisorChat /> },

          // Practice con sidebar
          {
            path: "practice/:curriculumId/:competencyId/:standardId/:learningObjectiveId",
            element: <Practice />,
          },

          // Roadmap
          { path: "roadmap", element: <RoadmapLauncher /> },
          { path: "roadmap/:id", element: <Roadmap /> },

          // Aulas (estudiante)
          {
            path: "classrooms",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <StudentClassrooms />
              </Suspense>
            ),
          },
          {
            path: "join",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <JoinClassroom />
              </Suspense>
            ),
          },

          // Otros
          { path: "profile", element: <StudentProfile /> },
          { path: "achievements", element: <Achievements /> },

          // Assessments (estudiante)
          {
            path: "assessments",
            element: (
              <Navigate to="available" replace />
            ) /* Alias de conveniencia */,
          },
          {
            path: "assessments/available",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <AvailableAssignments />
              </Suspense>
            ),
          },
          {
            path: "assessments/take/:submissionId",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <TakeAssessment />
              </Suspense>
            ),
          },
          {
            path: "assessments/result/:submissionId", // ✅ NUEVO: detalle/polling de resultados
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <SubmissionResult />
              </Suspense>
            ),
          },
          {
            path: "assessments/history",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <StudentHistory />
              </Suspense>
            ),
          },
        ],
      },

      /* ───────────────────── PERFIL GENERAL ───────────────────── */
      { path: "profile-dashboard", element: <ProfileDashboard /> },

      /* ───────────────────────── AJUSTES ──────────────────────── */
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

      /* ────────────────────────── ADMIN ───────────────────────── */
      {
        path: "admin",
        element: (
          <RoleRoute roles={["ROLE_ADMIN"]}>
            <Outlet />
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
          /* Herramientas de IA */
          {
            path: "ai-advisor",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <AdminAdvisorChat />
              </Suspense>
            ),
          },

          /* Herramientas assessments */
          { path: "assessments/tools", element: <AdminAssessmentTools /> },
          { path: "assessments/templates/new", element: <TemplateForm /> },
          { path: "assessments/templates", element: <TemplatesList /> },
          { path: "assessments/assignments/new", element: <AssignmentForm /> },
          { path: "assessments/templates/:id/edit", element: <TemplateForm /> },
          {
            path: "assessments/assignments",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <AdminAssignmentsList />
              </Suspense>
            ),
          },

          /* Explorador curricular (provee su propio provider) */
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

          /* Estándares */
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

          /* Objetivos de aprendizaje */
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

          /* Ejercicios */
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

          /* Pistas */
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

          /* Pasos de solución */
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

      /* ───────────────────────── TEACHER ───────────────────────── */
      {
        path: "teacher",
        element: (
          <RoleRoute roles={["ROLE_TEACHER", "ROLE_ADMIN"]}>
            <Outlet />
          </RoleRoute>
        ),
        children: [
          {
            path: "dashboard",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <TeacherDashboard />
              </Suspense>
            ),
          },
          {
            path: "classrooms",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <TeacherClassrooms />
              </Suspense>
            ),
          },
          {
            path: "classrooms/:id",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <TeacherClassroomDetail />
              </Suspense>
            ),
          },
          {
            path: "classrooms/:classroomId/students/:studentId",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <ClassroomStudentDetailPage />
              </Suspense>
            ),
          },

          // Assessments (docente)
          {
            path: "assessments",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <AssignmentsList />
              </Suspense>
            ),
          },
          { path: "assessments/new", element: <AssignmentForm /> },
          {
            path: "assessments/:assignmentId/submissions",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <AssignmentSubmissionsList />
              </Suspense>
            ),
          },
          {
            path: "assessments/:assignmentId/overview",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <AssignmentOverview />
              </Suspense>
            ),
          },
          {
            path: "assessments/:assignmentId/submissions/:submissionId",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <SubmissionDetailTeacher />
              </Suspense>
            ),
          },
          {
            path: "assessments/templates",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                {/* Reutilizamos la misma vista usada en Admin */}
                <TemplatesList />
              </Suspense>
            ),
          },
          {
            path: "assessments/templates/new",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <TemplateForm />
              </Suspense>
            ),
          },
          {
            path: "assessments/templates/:id/edit",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <TemplateForm />
              </Suspense>
            ),
          },
        ],
      },

      /* Catch-all de rutas desconocidas dentro del layout principal */
      { path: "*", element: <NotFound /> },
    ],
  },

  /* ╔══════════════════════╗
     ║  PLAYER sin sidebar  ║
     ╚══════════════════════╝ */
  {
    path: "/student/exercises/:curriculumId/:competencyId/:standardId/:learningObjectiveId/:exerciseId",
    element: (
      <ProtectedRoute>
        <RoleRoute roles={["ROLE_STUDENT"]}>
          <MinimalLayout>
            <ExercisePlayerByHierarchy />
          </MinimalLayout>
        </RoleRoute>
      </ProtectedRoute>
    ),
  },

  /* ╔══════════════════════╗
     ║       PÚBLICAS       ║
     ╚══════════════════════╝ */
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

  /* Catch-all global (por fuera del layout) */
  { path: "*", element: <NotFound /> },
]);
