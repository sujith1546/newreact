import React from "react";
import RouteErrorFallback from "./RouteErrorFallback";
import { reportDiagnosticsIssue } from "../../core/diagnostics/diagnosticsEngine";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    try {
      reportDiagnosticsIssue({
        type: 'runtime',
        severity: 'critical',
        title: `React Component Crash: ${error?.name || 'Render Error'}`,
        message: error?.message || 'Component failed to render and was caught by ErrorBoundary.',
        source: 'React ErrorBoundary',
        stack: (error?.stack || '') + (errorInfo?.componentStack ? `\nComponent Stack:${errorInfo.componentStack}` : ''),
        fixActionLabel: 'Inspect Component Stack',
      });
    } catch (_) {}
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === "function"
          ? this.props.fallback({ error: this.state.error, resetErrorBoundary: this.resetErrorBoundary })
          : this.props.fallback;
      }
      return <RouteErrorFallback error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />;
    }

    return this.props.children;
  }
}
