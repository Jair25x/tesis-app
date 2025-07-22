// src/components/LoadingScreen.tsx
import { useMemo } from "react";
import capybaraGif from "../assets/capibaramini-unscreen.gif"; // Usa tu nuevo gif sin fondo si lo cambias

const motivationalPhrases = [
  "¡Las matemáticas son como un juego de acertijos 🧩!",
  "Una mente curiosa resuelve hasta el mayor enigma 🧠",
  "Sumar es solo el comienzo de una gran aventura ➕",
  "¡Estás más cerca de convertirte en un genio matemático! ✨",
  "Cada número cuenta... ¡y tú también! 🔢",
  "El conocimiento es poder, ¡y tú estás cargando poder! ⚡",
  "Incluso los capibaras aman los desafíos 🦫❤️",
  "La práctica hace al maestro... ¡o al estudiante estrella! 🌟",
  "Resolver problemas es como atrapar estrellas 🌌",
  "¡Sigue así! Las matemáticas te están esperando 🧮",
];

export default function LoadingScreen({ message }: { message?: string }) {
  const phrase = useMemo(() => {
    if (message) return message;
    const index = Math.floor(Math.random() * motivationalPhrases.length);
    return motivationalPhrases[index];
  }, [message]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 dark:bg-[#1e2a34] text-black dark:text-white transition-colors duration-300 px-4">
      <img
        src={capybaraGif}
        alt="Capibara cargando"
        className="w-48 h-48 mb-6 object-contain"
      />
      <p className="text-center italic text-lg max-w-md">{phrase}</p>
    </div>
  );
}
