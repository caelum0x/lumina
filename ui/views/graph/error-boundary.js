import React from 'react'

class ThreeGalaxyErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = {hasError: false, error: null, errorInfo: null}
    }

    static getDerivedStateFromError(error) {
        return {hasError: true, error}
    }

    componentDidCatch(error, errorInfo) {
        console.error('3D Galaxy Error:', error, errorInfo)
        this.setState({
            error: typeof error === 'string' ? new Error(error) : error,
            errorInfo
        })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="three-galaxy-error">
                    <div className="error-content">
                        <h2>⚠️ 3D Visualization Error</h2>
                        <p>Unable to render 3D visualization. This might be due to:</p>
                        <ul>
                            <li>WebGL not supported or disabled in your browser</li>
                            <li>GPU acceleration disabled</li>
                            <li>Outdated graphics drivers</li>
                            <li>Browser compatibility issues</li>
                        </ul>
                        <div className="error-actions">
                            <button
                                onClick={() => {
                                    this.setState({hasError: false, error: null, errorInfo: null})
                                    window.location.reload()
                                }}
                                className="error-button"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={() => {
                                    this.setState({hasError: false, error: null, errorInfo: null})
                                }}
                                className="error-button secondary"
                            >
                                Try Again
                            </button>
                        </div>
                        {(typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') && this.state.error && (
                            <details className="error-details">
                                <summary>Error Details (Development Only)</summary>
                                <pre>{this.state.error.toString()}</pre>
                                {this.state.errorInfo && (
                                    <pre>{this.state.errorInfo.componentStack}</pre>
                                )}
                            </details>
                        )}
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ThreeGalaxyErrorBoundary

