import React from 'react'

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = {hasError: false, error: null}
    }

    static getDerivedStateFromError(error) {
        return {hasError: true, error}
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return <div className="segment error">
                <h3>Something went wrong</h3>
                <p className="dimmed">{this.state.error?.message || 'An unexpected error occurred'}</p>
                <button onClick={() => window.location.reload()} className="button">Reload Page</button>
            </div>
        }
        return this.props.children
    }
}
