import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-[#1e2a34] text-center text-black dark:text-white p-6">
      <img
        src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDQ2eDUxMnV1MXFpOXBkMTFjdG5wM3F4YTFwZzRqaTg1Z3pxYzQ4ZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/wHkICQVGBrq3yqayul/giphy.gif"
        alt="Capibara pensante"
        className="w-64 h-64 object-contain mb-6"
      />
      <h1 className="text-3xl font-bold mb-2">404 - Página no encontrada</h1>
      <p className="mb-4 text-gray-500 dark:text-gray-400">
        Lo sentimos, la página que buscas no existe.
      </p>
      <Link
        to="/dashboard"
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition"
      >
        🏠 Volver al Dashboard
      </Link>
    </div>
  );
}
