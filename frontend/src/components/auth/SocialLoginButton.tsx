// src/components/auth/SocialLoginButton.tsx
import { FcGoogle } from "react-icons/fc";

export default function SocialLoginButton() {
  return (
    <button
      className="flex items-center justify-center gap-2 border border-gray-500 px-4 py-2 w-full rounded opacity-60 cursor-not-allowed"
      aria-disabled="true"
      title="Disponible próximamente"
      type="button"
    >
      <FcGoogle className="text-xl" />
      <span className="text-sm">Iniciar con Google</span>
    </button>
  );
}
