// src/pages/admin/exercise/ExerciseForm.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createExercise,
  getExerciseAdminById,
  updateExercise,
} from "../../../services/exerciseService";
import type { ExerciseRequest } from "../../../types/exercise/ExerciseRequest";
import type { Difficulty } from "../../../types/exercise/Difficulty";
import type {
  TemplateSchemaResponse,
  TemplateType,
} from "../../../types/exercise/TemplateSchemaResponse";
import type { HintRequest } from "../../../types/exercise/HintResponse";
import type { SolutionStepRequest } from "../../../types/exercise/SolutionStepResponse";
import {
  getAllTemplates,
  getTemplateSchemaByType,
} from "../../../services/templateService";
import MustachePreview from "../../../components/MustachePreview";
import { showToast } from "../../../utils/showToast";

// Inline services
import { createHint } from "../../../services/hintService";
import { createSolutionStep } from "../../../services/solutionStepService";

// React Query (opcional)
import { useQueryClient } from "@tanstack/react-query";

// ✅ Zod para validación por plantilla
import { z } from "zod";

const difficultyOptions: Difficulty[] = ["BASIC", "INTERMEDIATE", "ADVANCED"];

/* ------------------------------------
   Zod: validación por plantilla
   (ajustada a la nueva firma de z.record
   y evitando .passthrough() deprecado)
-------------------------------------*/
const zChoice = z.string().min(1);
const zChoices = z
  .array(zChoice)
  .min(2, "Debes proporcionar al menos 2 opciones");

const schemaByTemplate: Record<TemplateType, z.ZodTypeAny> = {
  // EQUATION_SINGLE_CHOICE: choices[] + answer (string). Permitimos extras (.loose()).
  EQUATION_SINGLE_CHOICE: z
    .object({
      choices: zChoices,
      answer: z.string().min(1, "Debes indicar la respuesta correcta"),
    })
    .loose(),

  // FREQUENCY_TABLE_QA:
  // - columns: string[]
  // - rows: array de "record<string, string|number>" con al menos 1 key
  // - questions: shape mínimo
  FREQUENCY_TABLE_QA: z
    .object({
      columns: z.array(z.string().min(1)).min(2),
      rows: z
        .array(
          z
            .record(
              z.string(), // key type
              z.union([z.string(), z.number()]) // value type
            )
            .refine((o) => Object.keys(o).length > 0, "Fila vacía no permitida")
        )
        .min(1),
      questions: z
        .array(
          z.object({
            id: z.string().min(1),
            kind: z.enum(["single_choice", "numeric"]),
            prompt: z.string().min(1),
            options: z.array(z.string()).optional(), // solo para single_choice
            answer: z.union([z.string(), z.number()]),
          })
        )
        .min(1),
    })
    .loose(),

  // FREQUENCY_TABLE_COMPLETE:
  // - columns / rows igual que arriba
  // - missing: [{ cell: string, answer: number }]
  FREQUENCY_TABLE_COMPLETE: z
    .object({
      columns: z.array(z.string().min(1)).min(2),
      rows: z
        .array(
          z
            .record(
              z.string(), // key type
              z.union([z.string(), z.number()]) // value type
            )
            .refine((o) => Object.keys(o).length > 0, "Fila vacía no permitida")
        )
        .min(1),
      missing: z
        .array(
          z.object({
            cell: z.string().min(1),
            answer: z.number(),
          })
        )
        .min(1),
    })
    .loose(),
};

export default function ExerciseForm() {
  const navigate = useNavigate();
  const qc = useQueryClient();

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

  // Plantillas disponibles
  const [templateOptions, setTemplateOptions] = useState<
    TemplateSchemaResponse[]
  >([]);

  // Form principal
  const [form, setForm] = useState<ExerciseRequest>({
    statement: "",
    difficulty: "BASIC",
    type: "OPEN",
    templateType: "EQUATION_SINGLE_CHOICE",
    correctAnswer: "",
    parameters: {},
    learningObjectiveId: learningObjectiveId || "",
    isDiagnostic: false,
  });

  // JSON editor
  const [jsonText, setJsonText] = useState<string>("{}");
  const [jsonError, setJsonError] = useState<string>("");

  // Inline Hints/Steps
  const [pendingHints, setPendingHints] = useState<HintRequest[]>([]);
  const [pendingSteps, setPendingSteps] = useState<SolutionStepRequest[]>([]);

  // UX
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Esquema seleccionado + estado
  const [selectedSchema, setSelectedSchema] =
    useState<TemplateSchemaResponse | null>(null);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [schemaError, setSchemaError] = useState("");

  /* ------------------------------
     Cargar plantillas (lista)
  --------------------------------*/
  useEffect(() => {
    if (!curriculumId) return;
    getAllTemplates(curriculumId)
      .then((data) => setTemplateOptions(data))
      .catch(() => showToast.error("No se pudieron cargar las plantillas"));
  }, [curriculumId]);

  /* ------------------------------
     Cargar ejercicio si es edición
  --------------------------------*/
  useEffect(() => {
    if (!curriculumId || !learningObjectiveId) return;
    if (!isEditMode || !exerciseId) return;

    setLoading(true);
    getExerciseAdminById(
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
          correctAnswer: response.correctAnswer || "",
          parameters: response.parameters,
          learningObjectiveId: response.learningObjectiveId,
          isDiagnostic: response.isDiagnostic ?? false,
        });
        setJsonText(JSON.stringify(response.parameters, null, 2));
      })
      .catch(() => setError("No se pudo cargar el ejercicio."))
      .finally(() => setLoading(false));
  }, [
    isEditMode,
    exerciseId,
    curriculumId,
    competencyId,
    standardId,
    learningObjectiveId,
  ]);

  /* ------------------------------
     Cuando cambia templateType → cargar esquema
  --------------------------------*/
  useEffect(() => {
    if (!curriculumId || !form.templateType) return;

    setSchemaLoading(true);
    setSchemaError("");
    getTemplateSchemaByType(curriculumId, form.templateType)
      .then((schema) => {
        setSelectedSchema(schema);

        // Si statement está vacío y hay pattern, prellenar
        if (!form.statement && schema.pattern) {
          setForm((prev) => ({ ...prev, statement: schema.pattern || "" }));
        }

        // Si parameters vacío, prellenar con example
        const paramsEmpty =
          !form.parameters ||
          (Object.keys(form.parameters).length === 0 &&
            form.parameters.constructor === Object);

        if (paramsEmpty && schema.example) {
          const pretty = JSON.stringify(schema.example, null, 2);
          setJsonText(pretty);
          setForm((prev) => ({ ...prev, parameters: schema.example }));
          setJsonError("");
        }
      })
      .catch(() =>
        setSchemaError("No se pudo cargar el esquema de la plantilla.")
      )
      .finally(() => setSchemaLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curriculumId, form.templateType]);

  /* ------------------------------
     Validación Zod en vivo del JSON
  --------------------------------*/
  const zodErrors = useMemo<string[]>(() => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      return ["JSON inválido: " + (e as Error).message];
    }

    const tmpl = form.templateType as TemplateType;
    const validator = schemaByTemplate[tmpl];
    if (!validator) return [];

    const result = validator.safeParse(parsed);
    if (result.success) return [];

    return result.error.issues.map((issue) => {
      const path =
        Array.isArray(issue.path) && issue.path.length
          ? issue.path.map(String).join(".")
          : "(root)";
      return `${path}: ${issue.message}`;
    });
  }, [jsonText, form.templateType]);

  // Marcador simple de estado
  const isParamsValid = zodErrors.length === 0 && !jsonError;

  /* ------------------------------
     Handlers
  --------------------------------*/
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    setForm((prev) => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };

      // 👇 Si cambia la plantilla, cargamos ejemplo y patrón (si lo hay)
      if (name === "templateType") {
        const selected = templateOptions.find((t) => t.type === value);
        if (selected) {
          if (selected.example) {
            const pretty = JSON.stringify(selected.example, null, 2);
            setJsonText(pretty);
            next.parameters = selected.example;
            setJsonError("");
          }
          if (selected.pattern && typeof selected.pattern === "string") {
            // Sólo si quieres sobreescribir el enunciado cuando la plantilla define un patrón:
            next.statement = selected.pattern;
          }
        }
      }

      return next;
    });
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ExerciseRequest["templateType"];
    setForm((prev) => ({ ...prev, templateType: value }));
    setJsonError("");
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

  // Hints
  const addPendingHint = () =>
    setPendingHints((arr) => [...arr, { hintText: "", cost: 0 }]);
  const updatePendingHint = (idx: number, patch: Partial<HintRequest>) =>
    setPendingHints((arr) =>
      arr.map((h, i) => (i === idx ? { ...h, ...patch } : h))
    );
  const removePendingHint = (idx: number) =>
    setPendingHints((arr) => arr.filter((_, i) => i !== idx));

  // Steps
  const addPendingStep = () =>
    setPendingSteps((arr) => [
      ...arr,
      { stepNumber: (arr.at(-1)?.stepNumber ?? 0) + 1, explanation: "" },
    ]);
  const updatePendingStep = (
    idx: number,
    patch: Partial<SolutionStepRequest>
  ) =>
    setPendingSteps((arr) =>
      arr.map((s, i) => (i === idx ? { ...s, ...patch } : s))
    );
  const removePendingStep = (idx: number) =>
    setPendingSteps((arr) => arr.filter((_, i) => i !== idx));

  /* ------------------------------
     Guardar
  --------------------------------*/
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!curriculumId || !competencyId || !standardId || !learningObjectiveId)
      return;

    if (jsonError) {
      showToast.error("Corrige el JSON de parámetros antes de guardar.");
      return;
    }
    if (!isParamsValid) {
      showToast.error("Los parámetros no cumplen el esquema de la plantilla.");
      return;
    }

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

        // Crear nuevos hints/steps si hay pendientes
        for (const h of pendingHints) {
          await createHint(
            curriculumId,
            competencyId,
            standardId,
            learningObjectiveId,
            exerciseId,
            h
          );
        }
        for (const s of pendingSteps) {
          await createSolutionStep(
            curriculumId,
            competencyId,
            standardId,
            learningObjectiveId,
            exerciseId,
            s
          );
        }

        showToast.success("Ejercicio actualizado correctamente.");
      } else {
        const created = await createExercise(
          curriculumId,
          competencyId!,
          standardId!,
          learningObjectiveId!,
          form
        );

        const exId = created.id;
        for (const h of pendingHints) {
          await createHint(
            curriculumId,
            competencyId!,
            standardId!,
            learningObjectiveId!,
            exId,
            h
          );
        }
        for (const s of pendingSteps) {
          await createSolutionStep(
            curriculumId,
            competencyId!,
            standardId!,
            learningObjectiveId!,
            exId,
            s
          );
        }

        showToast.success("Ejercicio creado exitosamente.");
      }

      try {
        await qc.invalidateQueries({
          queryKey: [
            "exercisesByLO",
            curriculumId,
            competencyId,
            standardId,
            learningObjectiveId,
          ],
        });
      } catch {
        /* si no usas esta key aún, no pasa nada */
      }

      navigate(
        `/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises`
      );
    } catch (err) {
      console.error(err);
      showToast.error("Ocurrió un error al guardar el ejercicio.");
      setError("No se pudo guardar la información.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        {isEditMode ? "Editar Ejercicio" : "Nuevo Ejercicio"}
      </h1>

      {error && (
        <div
          className="mb-4 rounded bg-red-100 p-4 text-red-800 dark:bg-red-200 dark:text-red-900"
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Enunciado */}
        <div>
          <label
            htmlFor="statement"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
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
            className="w-full resize-none rounded-md border px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Dificultad */}
        <div>
          <label
            htmlFor="difficulty"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Dificultad
          </label>
          <select
            id="difficulty"
            name="difficulty"
            value={form.difficulty}
            onChange={handleChange}
            className="w-full rounded-md border px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
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
            className="w-full rounded-md border px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Plantilla + guía */}
        <div>
          <label
            htmlFor="templateType"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Tipo de plantilla
          </label>
          <select
            id="templateType"
            name="templateType"
            value={form.templateType}
            onChange={handleTemplateChange}
            className="w-full rounded-md border px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            {templateOptions.map((t) => (
              <option key={t.type} value={t.type}>
                {t.description}
              </option>
            ))}
          </select>

          {/* Tarjeta de ayuda */}
          <div className="mt-3 rounded-md border p-3 text-sm dark:border-gray-700">
            {schemaLoading ? (
              <div className="text-gray-500 dark:text-gray-400">
                Cargando esquema…
              </div>
            ) : schemaError ? (
              <div className="text-red-600 dark:text-red-400">
                {schemaError}
              </div>
            ) : selectedSchema ? (
              <>
                <div className="mb-2 font-semibold">Guía de esta plantilla</div>
                <p className="mb-2 text-gray-700 dark:text-gray-300">
                  {selectedSchema.description}
                </p>

                {selectedSchema.pattern ? (
                  <div className="mb-3">
                    <div className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Enunciado sugerido (pattern)
                    </div>
                    <pre className="max-h-24 overflow-auto rounded bg-gray-50 p-2 font-mono text-xs dark:bg-gray-900">
                      {selectedSchema.pattern}
                    </pre>
                    {!form.statement && (
                      <button
                        type="button"
                        className="mt-2 rounded-md border px-2 py-1 text-xs hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            statement: selectedSchema.pattern || "",
                          }))
                        }
                      >
                        Usar enunciado sugerido
                      </button>
                    )}
                  </div>
                ) : null}

                <div>
                  <div className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Ejemplo de parámetros (JSON)
                  </div>
                  <pre className="max-h-56 overflow-auto rounded bg-gray-50 p-2 font-mono text-xs dark:bg-gray-900">
                    {JSON.stringify(selectedSchema.example ?? {}, null, 2)}
                  </pre>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-md bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                      onClick={() => {
                        const pretty = JSON.stringify(
                          selectedSchema.example ?? {},
                          null,
                          2
                        );
                        setJsonText(pretty);
                        setForm((prev) => ({
                          ...prev,
                          parameters: selectedSchema.example ?? {},
                        }));
                        setJsonError("");
                      }}
                    >
                      Usar este ejemplo
                    </button>
                    <button
                      type="button"
                      className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
                      onClick={() => {
                        if (!selectedSchema) return;

                        let base: Record<string, unknown> = {};

                        if (
                          selectedSchema.fields &&
                          selectedSchema.fields.length > 0
                        ) {
                          const pickDefault = (
                            f: import("../../../types/exercise/FieldDescriptor").FieldDescriptor
                          ) => {
                            switch (f.type) {
                              case "NUMBER":
                                return 0;
                              case "BOOLEAN":
                                return false;
                              case "CHOICE":
                                return Array.isArray(f.choices) &&
                                  f.choices.length > 0
                                  ? f.choices[0]
                                  : "";
                              case "TEXT":
                              default:
                                return "";
                            }
                          };

                          base = selectedSchema.fields.reduce<
                            Record<string, unknown>
                          >((acc, f) => {
                            acc[f.name] = pickDefault(f);
                            return acc;
                          }, {});
                        } else {
                          base = selectedSchema.example ?? {};
                        }

                        const pretty = JSON.stringify(base, null, 2);
                        setJsonText(pretty);
                        setForm((prev) => ({ ...prev, parameters: base }));
                        setJsonError("");
                      }}
                    >
                      Insertar campos mínimos
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-gray-500 dark:text-gray-400">
                Selecciona una plantilla para ver su guía y ejemplo.
              </div>
            )}
          </div>
        </div>

        {/* Respuesta correcta */}
        <div>
          <label
            htmlFor="correctAnswer"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
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
            className="w-full rounded-md border px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Diagnóstico */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isDiagnostic"
            name="isDiagnostic"
            checked={form.isDiagnostic}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
          />
          <label
            htmlFor="isDiagnostic"
            className="text-sm text-gray-700 dark:text-gray-300"
          >
            Marcar este ejercicio como parte del test diagnóstico
          </label>
        </div>

        {/* Parámetros JSON + validación */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label
              htmlFor="parameters"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Parámetros (formato JSON)
            </label>
            <span
              className={`rounded px-2 py-0.5 text-xs ${
                jsonError || !isParamsValid
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200"
                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
              }`}
            >
              {jsonError
                ? "JSON inválido"
                : isParamsValid
                ? "JSON válido"
                : "No cumple el esquema"}
            </span>
          </div>

          <textarea
            id="parameters"
            name="parameters"
            rows={8}
            value={jsonText}
            onChange={handleJsonChange}
            className="w-full rounded-md border px-4 py-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />

          {/* Errores de Zod */}
          {!jsonError && !isParamsValid && (
            <div className="mt-2 rounded border border-red-300 bg-red-50 p-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
              <div className="mb-1 font-semibold">Problemas detectados:</div>
              <ul className="list-disc pl-5">
                {zodErrors.map((e: string, i: number) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Vista previa Mustache (solo para EQUATION_SINGLE_CHOICE) */}
        {form.templateType === "EQUATION_SINGLE_CHOICE" && !jsonError && (
          <div className="mt-2 rounded border border-dashed border-gray-300 p-4 dark:border-gray-600 dark:bg-gray-800">
            <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Vista previa del ejercicio
            </h3>
            <MustachePreview
              template={form.statement}
              parameters={form.parameters}
            />
          </div>
        )}

        {/* Inline Hints */}
        <div className="space-y-3 rounded-md border p-4 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Pistas a agregar</h3>
            <button
              type="button"
              className="text-sm underline"
              onClick={addPendingHint}
            >
              + Añadir pista
            </button>
          </div>
          {pendingHints.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No hay pistas pendientes.
            </p>
          )}
          {pendingHints.map((h, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-5">
              <input
                className="sm:col-span-4 rounded border px-2 py-1 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="Texto de la pista"
                value={h.hintText}
                onChange={(e) =>
                  updatePendingHint(i, { hintText: e.target.value })
                }
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="w-24 rounded border px-2 py-1 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Coste"
                  value={Number.isFinite(h.cost) ? h.cost : 0}
                  onChange={(e) =>
                    updatePendingHint(i, { cost: Number(e.target.value) || 0 })
                  }
                />
                <button
                  type="button"
                  onClick={() => removePendingHint(i)}
                  className="text-sm text-red-600 hover:underline dark:text-red-400"
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Inline Solution Steps */}
        <div className="space-y-3 rounded-md border p-4 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              Pasos de solución a agregar
            </h3>
            <button
              type="button"
              className="text-sm underline"
              onClick={addPendingStep}
            >
              + Añadir paso
            </button>
          </div>
          {pendingSteps.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No hay pasos pendientes.
            </p>
          )}
          {pendingSteps.map((s, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-5">
              <input
                type="number"
                className="w-24 rounded border px-2 py-1 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="# Paso"
                value={s.stepNumber}
                onChange={(e) =>
                  updatePendingStep(i, {
                    stepNumber: Number(e.target.value) || 1,
                  })
                }
              />
              <textarea
                className="sm:col-span-4 rounded border px-2 py-1 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="Explicación"
                value={s.explanation}
                onChange={(e) =>
                  updatePendingStep(i, { explanation: e.target.value })
                }
              />
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => removePendingStep(i)}
                  className="text-sm text-red-600 hover:underline dark:text-red-400"
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Botones */}
        <div className="flex flex-col items-start justify-start gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={loading || !!jsonError || !isParamsValid}
            className="rounded-md bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
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
            className="text-sm text-gray-700 underline dark:text-gray-300"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}
