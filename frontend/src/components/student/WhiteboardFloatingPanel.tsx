import { useEffect, useRef, useState } from "react";
import {
  ReactSketchCanvas,
  type ReactSketchCanvasRef,
} from "react-sketch-canvas";
import { X, Trash2, Eraser, Pencil, Download } from "lucide-react";

interface WhiteboardFloatingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  storageKey?: string; // clave por ejercicio
}

export default function WhiteboardFloatingPanel({
  isOpen,
  onClose,
  storageKey = "whiteboard-sketch-paths",
}: WhiteboardFloatingPanelProps) {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const [isEraser, setIsEraser] = useState(false);
  const loadedOnceRef = useRef(false);

  // Restaurar trazos previos al abrir (evita StrictMode doble)
  useEffect(() => {
    if (!isOpen) return;
    if (loadedOnceRef.current) return;
    loadedOnceRef.current = true;

    const restorePaths = async () => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (!saved || !canvasRef.current) return;

        const parsed = JSON.parse(saved) as unknown;
        const paths = Array.isArray(parsed)
          ? parsed
          : typeof parsed === "object" &&
            parsed !== null &&
            Array.isArray((parsed as { paths?: unknown[] }).paths)
          ? (parsed as { paths: unknown[] }).paths
          : [];

        if (paths.length === 0) return;
        await canvasRef.current.loadPaths(paths as never);
      } catch (error) {
        // El lib puede lanzar "No stroke found!" si paths = []
        if (error instanceof Error && /No stroke found/i.test(error.message)) {
          return; // ignoramos ese mensaje
        }
        // Otros errores sí los mostramos para depurar
        // eslint-disable-next-line no-console
        console.error("Error al restaurar la pizarra:", error);
      }
    };

    void restorePaths();
  }, [isOpen, storageKey]);

  // Guardar trazos automáticamente tras cada stroke
  const handleStroke = async () => {
    try {
      const paths = await canvasRef.current?.exportPaths();
      if (paths && paths.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(paths));
      } else {
        // si se borró todo con undo, limpiamos storage
        localStorage.removeItem(storageKey);
      }
    } catch {
      // noop
    }
  };

  const toggleTool = () => {
    canvasRef.current?.eraseMode(!isEraser);
    setIsEraser((v) => !v);
  };

  const handleExportImage = async () => {
    try {
      const paths = await canvasRef.current?.exportPaths();
      if (!paths || paths.length === 0) return; // nada que exportar

      const dataUrl = await canvasRef.current?.exportImage("png");
      if (dataUrl) {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "pizarra.png";
        link.click();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error al exportar la imagen:", error);
    }
  };

  const handleClear = async () => {
    await canvasRef.current?.clearCanvas();
    localStorage.removeItem(storageKey);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed z-40 shadow-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 rounded-lg flex flex-col overflow-hidden"
      style={{ width: 380, height: 420, bottom: "1rem", right: "1rem" }}
    >
      {/* Encabezado */}
      <div className="flex justify-between items-center px-3 py-2 bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200">
        <h2 className="text-sm font-semibold">✏️ Pizarra</h2>
        <button
          onClick={onClose}
          className="text-gray-600 dark:text-gray-300 hover:text-red-500"
        >
          <X size={20} />
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-white dark:bg-slate-800">
        <ReactSketchCanvas
          ref={canvasRef}
          width="100%"
          height="100%"
          strokeColor="#000"
          strokeWidth={4}
          eraserWidth={16}
          allowOnlyPointerType="all"
          onStroke={handleStroke}
          style={{ backgroundColor: "transparent" }}
        />
      </div>

      {/* Controles */}
      <div className="flex justify-around items-center gap-2 px-2 py-2 bg-gray-100 dark:bg-gray-800 border-t dark:border-gray-700">
        <button
          onClick={toggleTool}
          className={`flex items-center gap-1 px-3 py-1 rounded text-white font-semibold ${
            isEraser
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-rose-500 hover:bg-rose-600"
          }`}
        >
          {isEraser ? <Pencil size={16} /> : <Eraser size={16} />}
          {isEraser ? "Lápiz" : "Borrador"}
        </button>

        <button
          onClick={handleClear}
          className="flex items-center gap-1 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded"
        >
          <Trash2 size={16} />
          Limpiar
        </button>

        <button
          onClick={handleExportImage}
          className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white font-semibold rounded"
        >
          <Download size={16} />
          PNG
        </button>
      </div>
    </div>
  );
}
