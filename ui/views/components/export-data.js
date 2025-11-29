/**
 * Export data utilities for tables and lists
 */

/**
 * Export table data to CSV
 */
export function exportTableToCSV(tableElement, filename = 'export.csv') {
    if (!tableElement) return

    const rows = Array.from(tableElement.querySelectorAll('tr'))
    const csv = rows.map(row => {
        const cols = Array.from(row.querySelectorAll('td, th'))
        return cols.map(col => {
            const text = col.textContent.trim().replace(/"/g, '""')
            return `"${text}"`
        }).join(',')
    }).join('\n')

    downloadFile(csv, filename, 'text/csv')
}

/**
 * Export table data to JSON
 */
export function exportTableToJSON(tableElement, filename = 'export.json') {
    if (!tableElement) return

    const headers = Array.from(tableElement.querySelectorAll('th')).map(th => th.textContent.trim())
    const rows = Array.from(tableElement.querySelectorAll('tbody tr'))
    
    const data = rows.map(row => {
        const cols = Array.from(row.querySelectorAll('td'))
        const obj = {}
        headers.forEach((header, i) => {
            obj[header] = cols[i]?.textContent.trim() || ''
        })
        return obj
    })

    downloadFile(JSON.stringify(data, null, 2), filename, 'application/json')
}

/**
 * Export array of objects to CSV
 */
export function exportArrayToCSV(data, filename = 'export.csv') {
    if (!data || data.length === 0) return

    const headers = Object.keys(data[0])
    const csv = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header] || ''
                const text = String(value).replace(/"/g, '""')
                return `"${text}"`
            }).join(',')
        )
    ].join('\n')

    downloadFile(csv, filename, 'text/csv')
}

/**
 * Export array of objects to JSON
 */
export function exportArrayToJSON(data, filename = 'export.json') {
    downloadFile(JSON.stringify(data, null, 2), filename, 'application/json')
}

/**
 * Download file helper
 */
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], {type: mimeType})
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

/**
 * Export button component
 */
export function ExportButton({data, tableElement, format = 'csv', filename, className = ''}) {
    const handleExport = () => {
        if (format === 'csv') {
            if (tableElement) {
                exportTableToCSV(tableElement, filename)
            } else if (data) {
                exportArrayToCSV(data, filename)
            }
        } else if (format === 'json') {
            if (tableElement) {
                exportTableToJSON(tableElement, filename)
            } else if (data) {
                exportArrayToJSON(data, filename)
            }
        }
    }

    return (
        <button
            className={`export-button ${className}`}
            onClick={handleExport}
            title={`Export as ${format.toUpperCase()}`}
        >
            📥 Export {format.toUpperCase()}
        </button>
    )
}

