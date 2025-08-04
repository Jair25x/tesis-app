import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createExercise,
  getExerciseById,
  updateExercise,
} from "../../../services/exerciseService";
import type { ExerciseRequest } from "../../../types/exercise/ExerciseRequest";
import { showToast } from "../../../utils/showToast";
import type { Difficulty } from "../../../types/exercise/Difficulty";
import type { TemplateType } from "../../../types/exercise/TemplateType";
import MustachePreview from "../../../components/MustachePreview";

const difficultyOptions: Difficulty[] = ["BASIC", "INTERMEDIATE", "ADVANCED"];
const templateTypeOptions: TemplateType[] = [
  "MUSTACHE",
  "TBL_MATCH",
  "FILL_IN_THE_BLANK",
  "MULTIPLE_CHOICE",
];

export default function ExerciseForm() {
  const navigate = useNavigate();
  const {
    curriculumId,
    competencyId,
    standardId,
    learningObjectiveId,
    exerciseId,
  } = useParams<{
    curriculumId: string;
    competencyId: string;
    standardId: string;
    learningObjectiveId: string;
    exerciseId?: string;
  }>();

  const isEditMode = Boolean(exerciseId);

  const [form, setForm] = useState<ExerciseRequest>({
    statement: "",
    difficulty: "BASIC",
    type: "OPEN",
    templateType: "MUSTACHE",
    correctAnswer: "",
    parameters: {},
    learningObjectiveId: learningObjectiveId || "",
  });

  const [jsonError, setJsonError] = useState<string>("");
  const [jsonText, setJsonText] = useState<string>("{}");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!curriculumId || !learningObjectiveId) return;

    if (isEditMode && exerciseId) {
      setLoading(true);
      getExerciseById(
        curriculumId,
        competencyId!,
        standardId!,
        learningObjectiveId,
        exerciseId
      )
        .then((response) => {
          setForm({
            statement: response.statement,
            difficulty: response.difficulty,
            type: response.type,
            templateType: response.templateType,
            correctAnswer: response.correctAnswer,
            parameters: response.parameters,
            learningObjectiveId: response.learningObjectiveId,
          });
          setJsonText(JSON.stringify(response.parameters, null, 2));
        })
        .catch(() => setError("No se pudo cargar el ejercicio."))
        .finally(() => setLoading(false));
    }
  }, [
    isEditMode,
    exerciseId,
    curriculumId,
    competencyId,
    standardId,
    learningObjectiveId,
  ]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonText(value);
    try {
      const parsed = JSON.parse(value);
      setForm((prev) => ({ ...prev, parameters: parsed }));
      setJsonError("");
    } catch {
      setJsonError("JSON inválido");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!curriculumId || !competencyId || !standardId || !learningObjectiveId)
      return;

    setLoading(true);
    setError("");

    try {
      if (isEditMode && exerciseId) {
        await updateExercise(
          curriculumId,
          competencyId,
          standardId,
          learningObjectiveId,
          exerciseId,
          form
        );
        showToast.success("Ejercicio actualizado correctamente.");
      } else {
        await createExercise(
          curriculumId,
          competencyId,
          standardId,
          learningObjectiveId,
          form
        );
        showToast.success("Ejercicio creado exitosamente.");
      }

      navigate(
        `/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises`
      );
    } catch {
      showToast.error("Ocurrió un error al guardar el ejercicio.");
      setError("No se pudo guardar la información.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {isEditMode ? "Editar Ejercicio" : "Nuevo Ejercicio"}
      </h1>

      {error && (
        <div
          className="bg-red-100 text-red-800 p-4 rounded mb-4 dark:bg-red-200 dark:text-red-900"
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Enunciado */}
        <div>
          <label
            htmlFor="statement"
            className="block font-medium mb-1 text-sm text-gray-700 dark:text-gray-300"
          >
            Enunciado
          </label>
          <textarea
            id="statement"
            name="statement"
            rows={4}
            required
            maxLength={2000}
            value={form.statement}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md resize-none text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Dificultad */}
        <div>
          <label
            htmlFor="difficulty"
            className="block font-medium mb-1 text-sm text-gray-700 dark:text-gray-300"
          >
            Dificultad
          </label>
          <select
            id="difficulty"
            name="difficulty"
            value={form.difficulty}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            {difficultyOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo */}
        <div>
          <label
            htmlFor="type"
            className="block font-medium mb-1 text-sm text-gray-700 dark:text-gray-300"
          >
            Tipo
          </label>
          <input
            id="type"
            name="type"
            value={form.type}
            onChange={handleChange}
            required
            maxLength={100}
            className="w-full px-4 py-2 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Plantilla */}
        <div>
          <label
            htmlFor="templateType"
            className="block font-medium mb-1 text-sm text-gray-700 dark:text-gray-300"
          >
            Tipo de plantilla
          </label>
          <select
            id="templateType"
            name="templateType"
            value={form.templateType}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            {templateTypeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Respuesta correcta */}
        <div>
          <label
            htmlFor="correctAnswer"
            className="block font-medium mb-1 text-sm text-gray-700 dark:text-gray-300"
          >
            Respuesta correcta
          </label>
          <input
            id="correctAnswer"
            name="correctAnswer"
            value={form.correctAnswer}
            onChange={handleChange}
            required
            maxLength={1000}
            className="w-full px-4 py-2 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Parámetros JSON */}
        <div>
          <label
            htmlFor="parameters"
            className="block font-medium mb-1 text-sm text-gray-700 dark:text-gray-300"
          >
            Parámetros (formato JSON)
          </label>
          <textarea
            id="parameters"
            name="parameters"
            rows={6}
            value={jsonText}
            onChange={handleJsonChange}
            className="w-full px-4 py-2 border rounded-md font-mono text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          {jsonError && (
            <p className="text-sm text-red-500 mt-1">{jsonError}</p>
          )}
        </div>
        {/* Vista previa del ejercicio renderizado */}
        {form.templateType === "MUSTACHE" && !jsonError && (
          <div className="mt-4 border border-dashed border-gray-300 dark:border-gray-600 p-4 rounded bg-gray-50 dark:bg-gray-800">
            <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
              Vista previa del ejercicio:
            </h3>
            <MustachePreview
              template={form.statement}
              parameters={form.parameters}
            />
          </div>
        )}
        {/* Botones */}
        <div className="flex flex-col sm:flex-row justify-start sm:justify-between items-start sm:items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={loading || !!jsonError}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md disabled:opacity-50 text-sm"
          >
            {loading
              ? "Guardando..."
              : isEditMode
              ? "Actualizar Ejercicio"
              : "Crear Ejercicio"}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises`
              )
            }
            className="text-gray-700 dark:text-gray-300 underline text-sm"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}
