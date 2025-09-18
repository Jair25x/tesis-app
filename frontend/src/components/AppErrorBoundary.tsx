import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
  error?: Error;
}

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Aquí podrías enviar a Sentry/Log (ya integramos Sentry abajo)
    console.error("AppErrorBoundary", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="p-8 text-center">
            <h1 className="text-xl font-semibold mb-2">Algo salió mal</h1>
            <p className="opacity-80 mb-6">
              Ha ocurrido un error inesperado. Intenta recargar la página.
            </p>
            <button
              className="rounded-md px-4 py-2 bg-green-600 text-white"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
