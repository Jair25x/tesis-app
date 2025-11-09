// src/components/student/RecoEmpty.tsx
import capyGif from "../../assets/capibaramini-unscreen.gif";

type Props = {
  title?: string;
  subtitle?: string;
  hint?: string;
};

export default function RecoEmpty({
  title = "Aún no tengo ejercicios para recomendarte",
  subtitle = "Cuando empieces a practicar, Capiboth aprenderá de ti y te sugerirá retos hechos a tu medida.",
  hint = "Tip: Elige una competencia y comienza con un objetivo sencillo. ¡Yo me encargo del resto!",
}: Props) {
  return (
    <div className="w-full rounded-2xl border border-dashed p-6 md:p-8 dark:border-gray-700 bg-white/70 dark:bg-gray-900/40">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <img
          src={capyGif}
          alt="Capiboth"
          className="w-28 h-28 md:w-32 md:h-32 object-contain"
        />
        <div className="text-center md:text-left">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h4>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            {subtitle}
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        </div>
      </div>
    </div>
  );
}
