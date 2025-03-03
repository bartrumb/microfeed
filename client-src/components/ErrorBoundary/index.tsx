import React, { ErrorInfo } from 'react';
import { ErrorBoundaryProps } from '../../../common-src/types/FeedContent';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="lh-page-card grid grid-cols-1 gap-4">
          <div className="lh-page-title">
            Something went wrong
          </div>
          <div>
            <div className="mb-8">
              {this.props.fallback || 'There was an error loading this content.'}
            </div>
            {this.state.error && (
              <div className="text-sm text-red-500 mb-4">
                {this.state.error.toString()}
              </div>
            )}
            <a href="/admin/" className="text-brand-light">
              Return to dashboard <span className="lh-icon-arrow-right" />
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}