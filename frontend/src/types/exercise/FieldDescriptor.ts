/**
 * Tipos posibles de variable que se usan en una plantilla dinámica.
 */
export type FieldType = "NUMBER" | "CHOICE" | "TEXT";

/**
 * Describe una variable en una plantilla Mustache o similar.
 */
export interface FieldDescriptor {
  name: string;                     // Nombre como aparece en la plantilla (ej. {{a}})
  type: FieldType;                 // Tipo de dato: NUMBER, CHOICE, TEXT

  // Solo para type = NUMBER
  min?: number;
  max?: number;

  // Solo para type = CHOICE
  choices?: string[];
}
