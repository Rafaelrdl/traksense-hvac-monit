import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ChartWrapperProps {
  children: React.ReactNode;
  title?: string;
  height?: number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ChartErrorBoundary extends React.Component<
  ChartWrapperProps,
  ErrorBoundaryState
> {
  constructor(props: ChartWrapperProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chart error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div 
          className="flex items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed border-muted"
          style={{ height: this.props.height || 300 }}
        >
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm">
              Erro ao carregar gráfico{this.props.title ? ` - ${this.props.title}` : ''}
            </p>
            <button 
              className="mt-2 text-xs text-primary hover:underline"
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                // Force re-render
                this.forceUpdate();
              }}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    return <>{this.props.children}</>;
  }
}

export const ChartWrapper: React.FC<ChartWrapperProps> = ({ children, title, height }) => {
  return (
    <ChartErrorBoundary title={title} height={height}>
      {children}
    </ChartErrorBoundary>
  );
};