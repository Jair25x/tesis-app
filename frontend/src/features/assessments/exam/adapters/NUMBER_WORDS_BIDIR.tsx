// NUMBER_WORDS_BIDIR adapter (assessment)
// ruta similar a: src/pages/.../assessments/adapters/NUMBER_WORDS_BIDIR.ts
import type { ExamAdapter } from "../../../exercises/shared/types";
import type { NumberWordsParams } from "../../../../types/exercise/TemplateParams";
import CORE from "../../../exercises/shared/cores/NUMBER_WORDS_BIDIR";
import { normalizeWords, toNumberStrict } from "./_utils";

// 🔧 Clave: UIValue string para que encaje con CORE.Render/CORE.isValid
type UIValue = string;
type Wire = { value: string | number };

const MODULE: ExamAdapter<NumberWordsParams, UIValue, Wire> = {
  guard: CORE.guard,
  read: CORE.read,

  // Adaptamos la firma: el CORE valida strings,
  // pero nuestro ExamAdapter tipa UIValue como string también → OK
  isValid: (v, params) => CORE.isValid(v ?? "", params),

  // Adaptamos Render: el CORE pinta con string
  Render: (props) =>
    CORE.Render({
      ...props,
      value: (props.value ?? "") as string,
      onChange: (next: string) => props.onChange(next),
    }),

  // Persistimos número si es WORDS→DIGITS, o texto si DIGITS→WORDS / con choices
  write: (v: unknown, params?: NumberWordsParams): Wire => {
    const direction = params?.direction ?? "WORDS_TO_DIGITS";
    if (typeof v === "number" && Number.isFinite(v)) {
      return { value: v }; // ya es numérico
    }
    if (typeof v === "string") {
      if (direction === "DIGITS_TO_WORDS") {
        // esperamos palabras → normaliza
        return { value: normalizeWords(v) };
      }
      // WORDS_TO_DIGITS → intenta número; si no, 0
      const n = toNumberStrict(v);
      return n !== null ? { value: n } : { value: 0 };
    }
    // fallback
    return { value: "" };
  },
};

export default MODULE;
