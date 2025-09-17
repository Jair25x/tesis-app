// src/pages/admin/assessments/TemplateForm.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  createTemplate,
  getTemplate,
  updateTemplate,
} from "../../../services/assessmentsService";
import {
  getActiveCurricula,
  getCurriculumFull,
} from "../../../services/curriculumService";
import type {
  TemplateItemRequest,
  TemplateRequest,
  TemplateResponse,
  TemplateItemResponse,
  ShowCorrectAfter,
} from "../../../types/assessments/templates";
import type { CurriculumFullResponse } from "../../../types/curriculum/CurriculumFullResponse";
import { showToast } from "../../../utils/showToast";

/* ---------- Tipos ---------- */
type ItemDraft = TemplateItemRequest & { id?: string };
type IdName = { id: string; name: string };

/* ---------- Picker en cascada (NO se resetea al agregar) ---------- */
function ExercisePicker({
  onPick,
  onCurriculumPicked,
  initialCurriculumId,
}: {
  onPick: (sel: { objectiveId: string; exerciseId: string }) => void;
  onCurriculumPicked?: (curriculumId: string) => void;
  initialCurriculumId?: string;
}) {
  const [curricula, setCurricula] = useState<IdName[]>([]);
  const [curriculumId, setCurriculumId] = useState(initialCurriculumId ?? "");
  const [tree, setTree] = useState<CurriculumFullResponse | null>(null);

  const [competencyId, setCompetencyId] = useState("");
  const [standardId, setStandardId] = useState("");
  const [objectiveId, setObjectiveId] = useState("");
  const [exerciseId, setExerciseId] = useState("");

  const [loadingTree, setLoadingTree] = useState(false);

  useEffect(() => {
    getActiveCurricula()
      .then((list) =>
        setCurricula((list ?? []).map((c) => ({ id: c.id, name: c.name })))
      )
      .catch(() => setCurricula([]));
  }, []);

  useEffect(() => {
    if (initialCurriculumId) setCurriculumId(initialCurriculumId);
  }, [initialCurriculumId]);

  useEffect(() => {
    if (!curriculumId) {
      setTree(null);
      setCompetencyId("");
      setStandardId("");
      setObjectiveId("");
      setExerciseId("");
      return;
    }
    setLoadingTree(true);
    getCurriculumFull(curriculumId)
      .then((full) => {
        setTree(full ?? null);
        // Al cambiar de currículo, reseteamos niveles dependientes (intencional).
        setCompetencyId("");
        setStandardId("");
        setObjectiveId("");
        setExerciseId("");
        onCurriculumPicked?.(curriculumId);
      })
      .catch(() => {
        setTree(null);
        showToast.error("No se pudo cargar el currículo.");
      })
      .finally(() => setLoadingTree(false));
  }, [curriculumId, onCurriculumPicked]);

  const competencies: IdName[] = useMemo(() => {
    if (!tree?.competencies) return [];
    return tree.competencies.map((c) => ({ id: c.id, name: c.name }));
  }, [tree]);

  const standards: IdName[] = useMemo(() => {
    const comp = tree?.competencies?.find((c) => c.id === competencyId);
    return comp?.standards?.map((s) => ({ id: s.id, name: s.name })) ?? [];
  }, [tree, competencyId]);

  const learningObjectives: IdName[] = useMemo(() => {
    const comp = tree?.competencies?.find((c) => c.id === competencyId);
    const std = comp?.standards?.find((s) => s.id === standardId);
    return (
      std?.learningObjectives?.map((o) => ({ id: o.id, name: o.name })) ?? []
    );
  }, [tree, competencyId, standardId]);

  const selectedLO = useMemo(() => {
    const comp = tree?.competencies?.find((c) => c.id === competencyId);
    const std = comp?.standards?.find((s) => s.id === standardId);
    return std?.learningObjectives?.find((o) => o.id === objectiveId) ?? null;
  }, [tree, competencyId, standardId, objectiveId]);

  const exercisesFromTree: IdName[] = useMemo(() => {
    const list = selectedLO?.exercises ?? [];
    return list.map((e) => {
      const label = (e.statement || "").toString().slice(0, 100) || e.id;
      return { id: e.id, name: label };
    });
  }, [selectedLO]);

  const canPick = Boolean(objectiveId && exerciseId);

  return (
    <div className="rounded-xl border p-4 shadow-sm dark:border-gray-800">
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium">Currículo</label>
          <select
            className="w-full rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950"
            value={curriculumId}
            onChange={(e) => setCurriculumId(e.target.value)}
          >
            <option value="">Selecciona currículo…</option>
            {curricula.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {loadingTree && (
            <p className="mt-1 text-xs opacity-70">Cargando currículo…</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Competencia</label>
          <select
            className="w-full rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950"
            value={competencyId}
            onChange={(e) => {
              setCompetencyId(e.target.value);
              setStandardId("");
              setObjectiveId("");
              setExerciseId("");
            }}
            disabled={!tree}
          >
            <option value="">Selecciona…</option>
            {competencies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Estándar</label>
          <select
            className="w-full rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950"
            value={standardId}
            onChange={(e) => {
              setStandardId(e.target.value);
              setObjectiveId("");
              setExerciseId("");
            }}
            disabled={!competencyId}
          >
            <option value="">Selecciona…</option>
            {standards.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">
            Objetivo de aprendizaje
          </label>
          <select
            className="w-full rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950"
            value={objectiveId}
            onChange={(e) => {
              setObjectiveId(e.target.value);
              setExerciseId("");
            }}
            disabled={!standardId}
          >
            <option value="">Selecciona…</option>
            {learningObjectives.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium">Ejercicio</label>
          <select
            className="w-full rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950"
            value={exerciseId}
            onChange={(e) => setExerciseId(e.target.value)}
            disabled={!objectiveId}
          >
            <option value="">Selecciona…</option>
            {exercisesFromTree.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        disabled={!canPick}
        onClick={() => {
          if (objectiveId && exerciseId) {
            onPick({ objectiveId, exerciseId });
            // 👇 No reseteamos la selección (permite agregar varios del mismo OA)
          }
        }}
        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
      >
        Agregar ítem seleccionado
      </button>
    </div>
  );
}

/* ---------- Form principal (Create / Edit) ---------- */
export default function TemplateForm() {
  const { id } = useParams<{ id: string }>();
  const editing = Boolean(id);

  const [title, setTitle] = useState("");
  const [curriculumId, setCurriculumId] = useState("");
  const [items, setItems] = useState<ItemDraft[]>([]);
  const [config, setConfig] = useState<NonNullable<TemplateRequest["config"]>>({
    shuffle: false,
    showFeedback: true,
    allowHints: false,
    allowSolutionSteps: false,
    showCorrectAfter: "AFTER_SUBMIT",
  });
  const [submitting, setSubmitting] = useState(false);

  // Cargar plantilla para edición
  useEffect(() => {
    if (!editing || !id) return;
    let cancelled = false;
    (async () => {
      try {
        const tpl: TemplateResponse = await getTemplate(id);
        if (cancelled) return;
        setTitle(tpl.title ?? "");
        setCurriculumId(tpl.curriculumId ?? "");
        setItems(
          (tpl.items ?? []).map((it: TemplateItemResponse) => ({
            objectiveId: it.objectiveId,
            exerciseId: it.exerciseId,
            points: it.points,
            gradingMode: it.gradingMode,
          }))
        );
        setConfig({
          shuffle: !!tpl.config?.shuffle,
          showFeedback: !!tpl.config?.showFeedback,
          allowHints: !!tpl.config?.allowHints,
          allowSolutionSteps: !!tpl.config?.allowSolutionSteps,
          showCorrectAfter: tpl.config?.showCorrectAfter ?? "AFTER_SUBMIT",
        });
      } catch {
        showToast.error("No se pudo cargar la plantilla");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editing, id]);

  const onChangeShowCorrectAfter: React.ChangeEventHandler<
    HTMLSelectElement
  > = (e) => {
    setConfig((c) => ({
      ...c,
      showCorrectAfter: e.target.value as ShowCorrectAfter,
    }));
  };

  /* -------- Validaciones en caliente -------- */
  const titleError = title.trim().length === 0 ? "Ingresa un título" : "";
  const curriculumError = curriculumId ? "" : "Selecciona un currículo";
  const itemsError = items.length === 0 ? "Agrega al menos un ítem" : "";

  const itemErrors = items.map((it) => {
    const errs: string[] = [];
    if (!it.objectiveId) errs.push("Objetivo requerido");
    if (!it.exerciseId) errs.push("Ejercicio requerido");
    if (!(Number(it.points) > 0)) errs.push("Puntos > 0");
    return errs.join(" · ");
  });

  const isFormValid =
    !titleError &&
    !curriculumError &&
    !itemsError &&
    itemErrors.every((e) => e.length === 0);

  const totalPoints = useMemo(
    () =>
      items.reduce(
        (acc, it) => acc + (Number.isFinite(it.points) ? Number(it.points) : 0),
        0
      ),
    [items]
  );

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { objectiveId: "", exerciseId: "", points: 1, gradingMode: "AUTO" },
    ]);

  const existsExercise = (exerciseId: string) =>
    items.some((it) => it.exerciseId === exerciseId);

  const updateItem = (idx: number, patch: Partial<ItemDraft>) =>
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it))
    );

  const removeItem = (idx: number) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const submit = async () => {
    if (!isFormValid) {
      showToast.error("Revisa los campos marcados en rojo.");
      return;
    }
    const body: TemplateRequest = {
      title,
      curriculumId,
      items: items.map(({ objectiveId, exerciseId, points, gradingMode }) => ({
        objectiveId,
        exerciseId,
        points: Math.max(1, Number(points) || 1),
        gradingMode: gradingMode ?? "AUTO",
      })),
      config,
    };
    try {
      setSubmitting(true);
      if (editing && id) {
        const updated = await updateTemplate(id, body);
        showToast.success("Plantilla actualizada");
        await navigator.clipboard.writeText(updated.id);
        showToast.info("ID copiado al portapapeles");
      } else {
        const created = await createTemplate(body);
        showToast.success("Plantilla creada");
        await navigator.clipboard.writeText(created.id);
        showToast.info("ID copiado al portapapeles");
        setItems([]); // reset suave (NO tocamos selección del picker)
      }
    } catch {
      showToast.error(
        editing
          ? "No se pudo actualizar la plantilla"
          : "No se pudo crear la plantilla"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-6 sm:px-6 lg:px-8 flex items-start justify-center">
      <div className="w-full max-w-3xl">
        <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <header className="mb-5">
            <h1 className="text-2xl font-bold tracking-tight">
              {editing
                ? "Editar plantilla de evaluación"
                : "Nueva plantilla de evaluación"}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Define título, selección de ítems desde el currículo y la
              configuración.
            </p>
            {curriculumId && (
              <div className="mt-3 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                Currículo:{" "}
                <span className="ml-1 font-mono">{curriculumId}</span>
              </div>
            )}
          </header>

          {/* Título */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">Título</label>
            <input
              className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 ${
                titleError
                  ? "border-rose-500 focus:ring-rose-400 dark:border-rose-500"
                  : "focus:ring-indigo-500 dark:border-gray-700"
              } dark:bg-gray-950`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Evaluación OA 3.1"
            />
            {titleError && (
              <p className="mt-1 text-xs text-rose-600">{titleError}</p>
            )}
          </div>

          {/* Picker en cascada */}
          <div className="mb-4">
            <h2 className="mb-2 text-sm font-semibold">
              Selecciona ítems del currículo
            </h2>
            <ExercisePicker
              initialCurriculumId={curriculumId || undefined}
              onPick={({ objectiveId, exerciseId }) => {
                if (existsExercise(exerciseId)) {
                  showToast.info("Ese ejercicio ya fue agregado.");
                  return;
                }
                setItems((prev) => [
                  ...prev,
                  { objectiveId, exerciseId, points: 1, gradingMode: "AUTO" },
                ]);
              }}
              onCurriculumPicked={(id) => setCurriculumId(id)}
            />
          </div>

          {/* Lista de items */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Ítems</h2>
              <div className="flex items-center gap-3">
                <span className="text-xs opacity-80">
                  Total puntos: {totalPoints}
                </span>
                <button
                  className="text-sm text-indigo-600 underline hover:text-indigo-700 dark:text-indigo-400"
                  onClick={addItem}
                  type="button"
                >
                  + Añadir ítem vacío
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <p className="text-sm opacity-70">No hay ítems.</p>
            ) : (
              <div className="space-y-3">
                {items.map((it, i) => {
                  const err = itemErrors[i];
                  return (
                    <div
                      key={`${it.exerciseId || "new"}-${i}`}
                      className={`rounded-lg border p-3 shadow-sm ${
                        err ? "border-rose-500" : "dark:border-gray-800"
                      }`}
                    >
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium">
                            Objetivo (ID)
                          </label>
                          <input
                            className={`w-full rounded-lg border px-2 py-1 text-sm shadow-sm dark:bg-gray-950 ${
                              !it.objectiveId
                                ? "border-rose-500"
                                : "dark:border-gray-700"
                            }`}
                            value={it.objectiveId}
                            onChange={(e) =>
                              updateItem(i, { objectiveId: e.target.value })
                            }
                            placeholder="UUID del OA"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium">
                            Ejercicio (ID)
                          </label>
                          <input
                            className={`w-full rounded-lg border px-2 py-1 text-sm shadow-sm dark:bg-gray-950 ${
                              !it.exerciseId
                                ? "border-rose-500"
                                : "dark:border-gray-700"
                            }`}
                            value={it.exerciseId}
                            onChange={(e) =>
                              updateItem(i, { exerciseId: e.target.value })
                            }
                            placeholder="UUID del ejercicio"
                          />
                        </div>
                      </div>

                      <div className="mt-2 grid gap-2 sm:grid-cols-3">
                        <div>
                          <label className="mb-1 block text-xs font-medium">
                            Puntos
                          </label>
                          <input
                            type="number"
                            className={`w-full rounded-lg border px-2 py-1 text-sm shadow-sm dark:bg-gray-950 ${
                              !(Number(it.points) > 0)
                                ? "border-rose-500"
                                : "dark:border-gray-700"
                            }`}
                            value={it.points}
                            onChange={(e) =>
                              updateItem(i, {
                                points: Number(e.target.value) || 0,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-medium">
                            Corrección
                          </label>
                          <select
                            className="w-full rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950"
                            value={it.gradingMode ?? "AUTO"}
                            onChange={(e) =>
                              updateItem(i, {
                                gradingMode:
                                  e.target.value === "MANUAL"
                                    ? "MANUAL"
                                    : "AUTO",
                              })
                            }
                          >
                            <option value="AUTO">Automática</option>
                            <option value="MANUAL">Manual</option>
                          </select>
                        </div>

                        <div className="flex items-end">
                          <button
                            className="text-sm text-rose-600 underline"
                            onClick={() => removeItem(i)}
                            type="button"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>

                      {err && (
                        <p className="mt-2 text-xs text-rose-600">{err}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Config */}
          <div className="rounded-xl border p-3 shadow-sm dark:border-gray-800">
            <h2 className="mb-2 text-sm font-semibold">Configuración</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!config.shuffle}
                  onChange={(e) =>
                    setConfig((c) => ({ ...c, shuffle: e.target.checked }))
                  }
                />
                Mezclar ítems
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!config.showFeedback}
                  onChange={(e) =>
                    setConfig((c) => ({ ...c, showFeedback: e.target.checked }))
                  }
                />
                Mostrar feedback
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!config.allowHints}
                  onChange={(e) =>
                    setConfig((c) => ({ ...c, allowHints: e.target.checked }))
                  }
                />
                Permitir pistas
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!config.allowSolutionSteps}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      allowSolutionSteps: e.target.checked,
                    }))
                  }
                />
                Permitir pasos de solución
              </label>

              <div>
                <label className="mb-1 block text-xs font-medium">
                  Mostrar respuestas correctas
                </label>
                <select
                  className="w-full rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950"
                  value={config.showCorrectAfter ?? "AFTER_SUBMIT"}
                  onChange={onChangeShowCorrectAfter}
                >
                  <option value="NEVER">Nunca</option>
                  <option value="AFTER_SUBMIT">Después de enviar</option>
                  <option value="AFTER_CLOSE">Después de cerrar</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
              onClick={() => window.history.back()}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
              onClick={submit}
              disabled={submitting || !isFormValid}
              title={
                !isFormValid ? "Completa los campos requeridos" : undefined
              }
            >
              {submitting
                ? editing
                  ? "Guardando…"
                  : "Creando…"
                : editing
                ? "Guardar cambios"
                : "Crear plantilla"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
