import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }

type State = { hasError: boolean; message?: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: undefined }

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message }
  }

  override componentDidCatch(err: Error, info: ErrorInfo) {
    console.error('ErrorBoundary:', err, info.componentStack)
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert">
          <h1 className="error-boundary__title">Something broke</h1>
          <p className="error-boundary__text">
            The UI hit an unexpected error. You can try reloading the page.
          </p>
          {this.state.message ? (
            <pre className="error-boundary__pre">{this.state.message}</pre>
          ) : null}
          <button
            type="button"
            className="button-primary"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
