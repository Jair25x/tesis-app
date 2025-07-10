import capybaraGif from "../assets/capibaramini.gif";

export default function LoadingScreen({
  message = "A los capibaras les gustan los números 🦫",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-blue-100 text-blue-800">
      <img
        src={capybaraGif}
        alt="Capibara cargando"
        className="w-64 h-64 mb-6 rounded"
      />
      <p className="italic text-lg text-center px-4">{message}</p>
    </div>
  );
}
