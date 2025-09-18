// src/routes/admin.tsx
import { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";
import RoleRoute from "./RoleRoute";
import LoadingScreen from "../components/LoadingScreen";
import { StandardProvider } from "../context/StandardProvider";
import { CompetencyProvider } from "../context/CompetencyProvider";
import { LearningObjectiveProvider } from "../context/LearningObjectiveProvider";
import { ExerciseProvider } from "../context/ExerciseProvider";
import { HintProvider } from "../context/HintProvider";
import { SolutionStepProvider } from "../context/SolutionStepProvider";

// Páginas (lazy)
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const UserList = lazy(() => import("../pages/admin/users/UserList"));
const EditUser = lazy(() => import("../pages/admin/users/EditUser"));

const CurriculumList = lazy(
  () => import("../pages/admin/curricula/CurriculumList")
);
const CurriculumForm = lazy(
  () => import("../pages/admin/curricula/CurriculumForm")
);
const CurriculumDetails = lazy(
  () => import("../pages/admin/curricula/CurriculumDetails")
);

const CompetencyList = lazy(
  () => import("../pages/admin/competencies/CompetencyList")
);
const CompetencyForm = lazy(
  () => import("../pages/admin/competencies/CompetencyForm")
);
const CompetencyDetails = lazy(
  () => import("../pages/admin/competencies/CompetencyDetails")
);

const StandardList = lazy(
  () => import("../pages/admin/standards/StandardList")
);
const StandardForm = lazy(
  () => import("../pages/admin/standards/StandardForm")
);
const StandardDetails = lazy(
  () => import("../pages/admin/standards/StandardDetails")
);

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

const HintList = lazy(() => import("../pages/admin/hints/HintList"));
const HintForm = lazy(() => import("../pages/admin/hints/HintForm"));
const HintDetails = lazy(() => import("../pages/admin/hints/HintDetails"));

const SolutionStepList = lazy(
  () => import("../pages/admin/solutionStep/SolutionStepList")
);
const SolutionStepForm = lazy(
  () => import("../pages/admin/solutionStep/SolutionStepForm")
);
const SolutionStepDetails = lazy(
  () => import("../pages/admin/solutionStep/SolutionStepDetails")
);

const AdminAssessmentTools = lazy(
  () => import("../pages/admin/assessments/AdminAssessmentTools")
);
const TemplatesList = lazy(
  () => import("../pages/admin/assessments/TemplatesList")
);
const TemplateForm = lazy(
  () => import("../pages/admin/assessments/TemplateForm")
);
const AssignmentForm = lazy(
  () => import("../pages/admin/assessments/AssignmentForm")
);
const AdminAssignmentsList = lazy(
  () => import("../pages/admin/assessments/AdminAssignmentsList")
);
const AdminAdvisorChat = lazy(
  () => import("../pages/admin/ai/AdminAdvisorChat")
);

// Explorer (no lazy en tu código, pero puede ser lazy si quieres)
import ExplorerDashboard from "../pages/admin/explorer/ExplorerDashboard";
import { ExplorerProvider } from "../pages/admin/explorer/ExplorerProvider";

// Catálogo global (lazy)
const AllCompetencies = lazy(
  () => import("../pages/admin/catalog/AllCompetencies")
);
const AllStandards = lazy(() => import("../pages/admin/catalog/AllStandards"));
const AllObjectives = lazy(
  () => import("../pages/admin/catalog/AllObjectives")
);
const AllExercises = lazy(() => import("../pages/admin/catalog/AllExercises"));

export const adminRoute = {
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

    // IA
    {
      path: "ai-advisor",
      element: (
        <Suspense fallback={<LoadingScreen />}>
          <AdminAdvisorChat />
        </Suspense>
      ),
    },

    // Evaluaciones
    {
      path: "assessments/tools",
      element: (
        <Suspense fallback={<LoadingScreen />}>
          <AdminAssessmentTools />
        </Suspense>
      ),
    },
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
    {
      path: "assessments/assignments",
      element: (
        <Suspense fallback={<LoadingScreen />}>
          <AdminAssignmentsList />
        </Suspense>
      ),
    },
    {
      path: "assessments/assignments/new",
      element: (
        <Suspense fallback={<LoadingScreen />}>
          <AssignmentForm />
        </Suspense>
      ),
    },

    // Explorer
    {
      path: "explorer",
      element: (
        <ExplorerProvider>
          <ExplorerDashboard />
        </ExplorerProvider>
      ),
    },

    // Catálogo global
    {
      path: "catalog",
      children: [
        {
          path: "competencies",
          element: (
            <Suspense fallback={<LoadingScreen />}>
              <AllCompetencies />
            </Suspense>
          ),
        },
        {
          path: "standards",
          element: (
            <Suspense fallback={<LoadingScreen />}>
              <AllStandards />
            </Suspense>
          ),
        },
        {
          path: "objectives",
          element: (
            <Suspense fallback={<LoadingScreen />}>
              <AllObjectives />
            </Suspense>
          ),
        },
        {
          path: "exercises",
          element: (
            <Suspense fallback={<LoadingScreen />}>
              <AllExercises />
            </Suspense>
          ),
        },
      ],
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
    {
      path: "curricula",
      element: (
        <Suspense fallback={<LoadingScreen />}>
          <CurriculumList />
        </Suspense>
      ),
    },
    {
      path: "curricula/new",
      element: (
        <Suspense fallback={<LoadingScreen />}>
          <CurriculumForm />
        </Suspense>
      ),
    },
    {
      path: "curricula/:id/edit",
      element: (
        <Suspense fallback={<LoadingScreen />}>
          <CurriculumForm />
        </Suspense>
      ),
    },
    {
      path: "curricula/:id/details",
      element: (
        <Suspense fallback={<LoadingScreen />}>
          <CurriculumDetails />
        </Suspense>
      ),
    },

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

    // Objetivos
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

    // Pasos de solución
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
};
