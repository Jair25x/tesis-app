import { lazy, Suspense } from "react";
import { Outlet, Navigate } from "react-router-dom";
import RoleRoute from "./RoleRoute";
import LoadingScreen from "../components/LoadingScreen";

const StudentDashboard = lazy(
  () => import("../pages/student/StudentDashboard")
);
const AdvisorChat = lazy(() => import("../pages/student/ai/AdvisorChat"));
const Practice = lazy(() => import("../pages/student/Practice"));
const Roadmap = lazy(() => import("../pages/student/Roadmap"));
const RoadmapLauncher = lazy(() => import("../pages/student/RoadmapLauncher"));
const StudentProfile = lazy(() => import("../pages/student/Profile"));
const Achievements = lazy(() => import("../pages/student/Achievements"));
const StudentClassrooms = lazy(
  () => import("../pages/student/StudentClassroomsPage")
);
const JoinClassroom = lazy(() => import("../pages/student/JoinClassroomPage"));
const AvailableAssignments = lazy(
  () => import("../pages/student/assessments/AvailableAssignments")
);
const TakeAssessment = lazy(
  () => import("../pages/student/assessments/TakeAssessment")
);
const SubmissionResult = lazy(
  () => import("../pages/student/assessments/SubmissionResult")
);
const StudentHistory = lazy(
  () => import("../pages/student/assessments/History")
);

// 👇 NUEVO
const DuelNew = lazy(() => import("../pages/student/duels/DuelNew"));
const DuelRoom = lazy(() => import("../pages/student/duels/DuelRoom"));
const DuelJoin = lazy(() => import("../pages/student/duels/DuelJoin"));
export const studentRoute = {
  path: "student",
  element: (
    <RoleRoute roles={["ROLE_STUDENT"]}>
      <Outlet />
    </RoleRoute>
  ),
  children: [
    { index: true, element: <Navigate to="dashboard" replace /> },

    {
      path: "dashboard",
      element: (
        <Suspense fallback={<LoadingScreen />}>
          <StudentDashboard />
        </Suspense>
      ),
    },
    {
      path: "ai-advisor",
      element: (
        <Suspense fallback={<LoadingScreen />}>
          <AdvisorChat />
        </Suspense>
      ),
    },
    {
      path: "practice/:curriculumId/:competencyId/:standardId/:learningObjectiveId",
      element: (
        <Suspense fallback={<LoadingScreen />}>
          <Practice />
        </Suspense>
      ),
    },
    {
      path: "roadmap",
      element: (
        <Suspense fallback={<LoadingScreen />}>
          <RoadmapLauncher />
        </Suspense>
      ),
    },
    {
      path: "roadmap/:id",
      element: (
        <Suspense fallback={<LoadingScreen />}>
          <Roadmap />
        </Suspense>
      ),
    },
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
    {
      path: "profile",
      element: (
        <Suspense fallback={<LoadingScreen />}>
          <StudentProfile />
        </Suspense>
      ),
    },
    {
      path: "achievements",
      element: (
        <Suspense fallback={<LoadingScreen />}>
          <Achievements />
        </Suspense>
      ),
    },

    // Assessments
    { path: "assessments", element: <Navigate to="available" replace /> },
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
      path: "assessments/result/:submissionId",
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

    // NUEVO: Duelos
    {
      path: "duels/new",
      element: (
        <Suspense fallback={<LoadingScreen />}>
          <DuelNew />
        </Suspense>
      ),
    },
    {
      // por UUID directo (o también puede ser un código si prefieres)
      path: "duels/:matchId",
      element: (
        <Suspense fallback={<LoadingScreen />}>
          <DuelRoom />
        </Suspense>
      ),
    },
    {
      // join por código con UI propia
      path: "duels/join",
      element: (
        <Suspense fallback={<LoadingScreen />}>
          <DuelJoin />
        </Suspense>
      ),
    },
    {
      // opción “room por código” si navegas con ?code=ABC123
      path: "duels/room",
      element: (
        <Suspense fallback={<LoadingScreen />}>
          <DuelRoom />
        </Suspense>
      ),
    },
  ],
};
