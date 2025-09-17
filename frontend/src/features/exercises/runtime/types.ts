import type { ReactNode } from "react";

/** Núcleo compartido (agnóstico a modo). */
export type CoreModule<TParams, TValue> = {
  /** Valida/normaliza parámetros del backend. Devuelve null si no aplican. */
  guard: (p: unknown) => TParams | null;

  /** Lee el valor inicial del JSON (si existe) guardado localmente. */
  read: (raw?: string) => TValue;

  /** Validador opcional del valor vs parámetros (para habilitar submit, etc.). */
  isValid?: (v: TValue, params: TParams) => boolean;

  /** UI del template. */
  Render: (props: {
    params: TParams;
    value: TValue;
    onChange: (next: TValue) => void;
    statementHtml?: string | null;
    submissionItemId: string;
  }) => ReactNode;
};

/** Adaptador para práctica (runtime). */
export type RuntimeAdapter<TParams, TValue> = CoreModule<TParams, TValue> & {
  /**
   * Serializa el valor actual a un objeto JSON plano
   * (forma “de usuario” que guardas como texto o envías al BE en práctica).
   * Firma pública con `unknown` para que sea asignable en registros heterogéneos.
   */
  write: (v: unknown) => Record<string, unknown>;
};

/** Adaptador para examen (assessment). */
export type ExamAdapter<
  TParams,
  TValue,
  TWire extends Record<string, unknown>
> = CoreModule<TParams, TValue> & {
  /**
   * Serializa el valor actual a la forma que persistes (y que luego
   * el submit enviará envuelto en { value: ... }).
   * Firma pública con `unknown` para usar en registros heterogéneos.
   */
  write: (v: unknown) => TWire;
};
