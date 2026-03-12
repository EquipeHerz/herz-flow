import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#fff', color: '#000', height: '100vh' }}>
          <h1 style={{ color: 'red' }}>Algo deu errado (ErrorBoundary)</h1>
          <p>Ocorreu um erro inesperado na aplicação.</p>
          <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', overflow: 'auto' }}>
            {this.state.error?.toString()}
            {this.state.error?.stack}
          </pre>
          <button 
            style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}
            onClick={() => window.location.href = '/'}
          >
            Voltar ao Início
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
