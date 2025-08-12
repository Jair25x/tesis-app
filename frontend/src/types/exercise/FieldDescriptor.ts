/**
 * Tipos posibles de variable que se usan en una plantilla dinámica.
 */
export type FieldType = "NUMBER" | "CHOICE" | "TEXT" | "BOOLEAN";

/**
 * Describe una variable en una plantilla Mustache o similar.
 */
export interface FieldDescriptor {
  name: string; // ej. {{a}}
  type: FieldType;

  // Solo para NUMBER
  min?: number;
  max?: number;

  // Solo para CHOICE
  choices?: string[];
}
