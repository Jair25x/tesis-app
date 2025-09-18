// src/routes/teacher.tsx
import { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";
import RoleRoute from "./RoleRoute";
import LoadingScreen from "../components/LoadingScreen";

const TeacherDashboard = lazy(
  () => import("../pages/teacher/TeacherDashboard")
);
const TeacherRecommendations = lazy(
  () => import("../pages/teacher/ai/TeacherRecommendations")
);
const TeacherClassrooms = lazy(() => import("../pages/teacher/Classrooms"));
const TeacherClassroomDetail = lazy(
  () => import("../pages/teacher/ClassroomDetail")
);
const ClassroomStudentDetailPage = lazy(
  () => import("../pages/teacher/ClassroomStudentDetailPage")
);
const AssignmentsList = lazy(
  () => import("../pages/teacher/assessments/AssignmentsList")
);
const AssignmentOverview = lazy(
  () => import("../pages/teacher/assessments/AssignmentOverview")
);
const AssignmentSubmissionsList = lazy(
  () => import("../pages/teacher/assessments/AssignmentSubmissionsList")
);
const SubmissionDetailTeacher = lazy(
  () => import("../pages/teacher/assessments/SubmissionDetailTeacher")
);
const TemplateForm = lazy(
  () => import("../pages/admin/assessments/TemplateForm")
);
const TemplatesList = lazy(
  () => import("../pages/admin/assessments/TemplatesList")
);
const AssignmentForm = lazy(
  () => import("../pages/admin/assessments/AssignmentForm")
);

export const teacherRoute = {
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
      path: "ai/recommendations",
      element: (
        <Suspense fallback={<LoadingScreen />}>
          <TeacherRecommendations />
        </Suspense>
      ),
    },

    // Aulas
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
    {
      path: "assessments/new",
      element: (
        <Suspense fallback={<LoadingScreen />}>
          <AssignmentForm />
        </Suspense>
      ),
    },
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

    // Plantillas desde Teacher (reuso Admin)
    {
      path: "assessments/templates",
      element: (
        <Suspense fallback={<LoadingScreen />}>
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
};
