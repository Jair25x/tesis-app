// src/types/assessments/templates.ts
import type { UUID } from "./common";

/** Config compartida (tu BE devuelve JsonNode con esta forma) */
export type ShowCorrectAfter = "NEVER" | "AFTER_SUBMIT" | "AFTER_CLOSE";
export interface TemplateConfig {
  shuffle?: boolean;
  showFeedback?: boolean;
  allowHints?: boolean;
  allowSolutionSteps?: boolean;
  showCorrectAfter?: ShowCorrectAfter;
}

/** ===== Requests ===== */
export interface TemplateItemRequest {
  objectiveId: UUID;
  exerciseId: UUID;
  points: number;
  gradingMode?: "AUTO" | "MANUAL";
}

export interface TemplateRequest {
  title: string;
  curriculumId: UUID;
  items: TemplateItemRequest[];
  config?: TemplateConfig;
}

/** ===== Responses ===== */
export interface TemplateItemResponse {
  id: UUID;
  objectiveId: UUID;
  exerciseId: UUID;
  points: number;
  position: number;
  gradingMode: "AUTO" | "MANUAL";
}

export interface TemplateResponse {
  id: UUID;
  ownerUuid?: UUID;
  title: string | null;
  curriculumId: UUID;
  config?: TemplateConfig; // BE: JsonNode
  items: TemplateItemResponse[];
  createdAt?: string; // LocalDateTime → ISO string
  updatedAt?: string; // LocalDateTime → ISO string
}

/** ===== Summary (lista paginada) ===== */
export interface TemplateItemSummary {
  objectiveId: UUID;
  exerciseId: UUID;
  points?: number | null;
  gradingMode: "AUTO" | "MANUAL";
  position?: number | null;
}

export interface TemplateSummaryDto {
  id: UUID;
  title: string;
  curriculumId: UUID;
  ownerUuid?: UUID;
  itemsCount: number;
  hasManualItems: boolean; // <-- nombre real del BE
  createdAt?: string;
  updatedAt?: string;
  /** Presente solo si includeItemSummaries=true */
  itemSummaries?: TemplateItemSummary[] | null;
}

/** ===== Filtros de listado ===== */
export interface TemplateListParams {
  page?: number;
  size?: number;
  sort?: string; // ej: "updatedAt,desc"
  mineOnly?: boolean;
  curriculumId?: UUID;
  title?: string;
  updatedFrom?: string; // ISO
  updatedTo?: string; // ISO
  includeItemSummaries?: boolean;
}
