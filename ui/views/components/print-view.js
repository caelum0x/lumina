import React from 'react'
import './print-view.scss'

/**
 * Print-friendly wrapper component
 */
export function PrintView({children, title, className = ''}) {
    React.useEffect(() => {
        // Add print styles
        const style = document.createElement('style')
        style.textContent = `
            @media print {
                body * {
                    visibility: hidden;
                }
                .print-content, .print-content * {
                    visibility: visible;
                }
                .print-content {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
                .no-print {
                    display: none !important;
                }
            }
        `
        document.head.appendChild(style)

        return () => {
            document.head.removeChild(style)
        }
    }, [])

    return (
        <div className={`print-content ${className}`}>
            {title && <h1 className="print-title">{title}</h1>}
            {children}
        </div>
    )
}

/**
 * Print button component
 */
export function PrintButton({title, className = ''}) {
    const handlePrint = () => {
        window.print()
    }

    return (
        <button
            className={`print-button ${className}`}
            onClick={handlePrint}
            title="Print this page"
        >
            🖨️ Print
        </button>
    )
}

