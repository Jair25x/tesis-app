// src/components/ui/ConfirmModal.tsx
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
  Description,
} from "@headlessui/react";
import { Fragment } from "react";
import { AlertTriangle, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  variant?: "danger" | "success" | "warning";
  isLoading?: boolean; // ✅ Nuevo
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  variant = "danger",
  isLoading = false, // ✅ valor por defecto
}: ConfirmModalProps) {
  const variantStyles = {
    danger: {
      color: "text-red-600",
      bg: "bg-red-600 hover:bg-red-700",
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
    },
    success: {
      color: "text-green-600",
      bg: "bg-green-600 hover:bg-green-700",
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
    },
    warning: {
      color: "text-yellow-600",
      bg: "bg-yellow-500 hover:bg-yellow-600",
      icon: <AlertCircle className="w-6 h-6 text-yellow-600" />,
    },
  };

  const { color, bg, icon } = variantStyles[variant];

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="w-full max-w-md rounded-lg bg-white dark:bg-gray-900 p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                {icon}
                <DialogTitle className={`text-lg font-bold ${color}`}>
                  {title}
                </DialogTitle>
              </div>
              <Description className="text-sm text-gray-700 dark:text-gray-300">
                {description}
              </Description>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded text-white flex items-center gap-2 ${bg} transition disabled:opacity-50`}
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirmar
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
