import type { ReactNode } from "react";
import type { TemplateType } from "../../../../types/exercise/TemplateSchemaResponse";
import type {
  FreqQAParams,
  FreqCompleteParams,
} from "../../../../types/exercise/TemplateParams";

export type TemplateId = TemplateType;

/** Módulo por template, fuertemente tipado para cada caso */
export type TemplateModuleBase<TParams, TValue, TWire> = {
  guard: (p: unknown) => TParams | null; // valida/normaliza parámetros
  read: (raw: string | undefined) => TValue; // string(JSON) -> valor UI
  write: (v: TValue) => TWire; // valor UI -> objeto que se serializa a JSON
  Render: (props: {
    params: TParams;
    value: TValue;
    onChange: (next: TValue) => void;
    statementHtml?: string | null;
    submissionItemId: string;
  }) => ReactNode;
};

/** Tipos por template soportado hoy */
export type SC_Params = { choices: string[] };
export type SC_Value = string;
export type SC_Wire = { selected: string };

export type QA_Params = FreqQAParams;
export type QA_Value = Record<string, string | number>;
export type QA_Wire = { answers: Record<string, string | number> };

export type FC_Params = FreqCompleteParams;
export type FC_Value = Record<string, number>;
export type FC_Wire = { filled: Record<string, number> };

/** Registry con tipos exactos por clave */
export type TemplateRegistry = {
  EQUATION_SINGLE_CHOICE: TemplateModuleBase<SC_Params, SC_Value, SC_Wire>;
  FREQUENCY_TABLE_QA: TemplateModuleBase<QA_Params, QA_Value, QA_Wire>;
  FREQUENCY_TABLE_COMPLETE: TemplateModuleBase<FC_Params, FC_Value, FC_Wire>;
};
