import { FcGoogle } from "react-icons/fc";

export default function SocialLoginButton() {
  return (
    <button
      className="flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-600 px-4 py-2 w-full rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm shadow-sm opacity-60 cursor-not-allowed"
      aria-disabled="true"
      title="Disponible próximamente"
      type="button"
    >
      <FcGoogle className="text-xl" />
      <span>Iniciar con Google</span>
    </button>
  );
}
