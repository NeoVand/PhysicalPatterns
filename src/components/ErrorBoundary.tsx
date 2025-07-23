import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            <div className="bg-red-950/20 border border-red-900/50 rounded-2xl p-8 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl">⚠️</span>
                <h1 className="text-3xl font-bold text-red-400">Something went wrong</h1>
              </div>
              
              <p className="text-gray-300 mb-6">
                The application encountered an unexpected error. You can try reloading the page or going back to the homepage.
              </p>
              
              {this.state.error && (
                <details className="mb-6">
                  <summary className="cursor-pointer text-gray-400 hover:text-gray-300 mb-2">
                    Error details (for developers)
                  </summary>
                  <div className="bg-gray-900/50 rounded-lg p-4 mt-2 font-mono text-sm">
                    <p className="text-red-400 mb-2">{this.state.error.toString()}</p>
                    {this.state.errorInfo && (
                      <pre className="text-gray-500 text-xs overflow-x-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
              
              <div className="flex gap-4">
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  Go to Homepage
                </button>
                <button
                  onClick={this.handleReset}
                  className="px-6 py-3 bg-gray-800 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 