// src/components/auth/SocialLoginButton.tsx
import { FcGoogle } from "react-icons/fc";

export default function SocialLoginButton() {
  return (
    <button
      className="flex items-center justify-center gap-2 border border-gray-500 px-4 py-2 w-full rounded hover:bg-gray-700 transition"
      onClick={() => alert("Funcionalidad pendiente")}
    >
      <FcGoogle className="text-xl" />
      <span className="text-sm">Iniciar con Google</span>
    </button>
  );
}
