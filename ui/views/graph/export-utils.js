/**
 * Export utilities for 3D visualization
 */

/**
 * Capture screenshot of 3D scene
 * @param {HTMLCanvasElement} canvas - Three.js canvas element
 * @param {string} filename - Output filename
 */
export function captureScreenshot(canvas, filename = 'lumina-3d-screenshot.png') {
    if (!canvas) return

    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }, 'image/png')
}

/**
 * Start video recording of 3D scene
 * @param {HTMLCanvasElement} canvas - Three.js canvas element
 * @param {number} duration - Recording duration in seconds
 * @param {number} fps - Frames per second
 */
export async function startVideoRecording(canvas, duration = 10, fps = 30) {
    if (!canvas) return null

    const stream = canvas.captureStream(fps)
    const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
    })

    const chunks = []

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            chunks.push(event.data)
        }
    }

    return new Promise((resolve, reject) => {
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, {type: 'video/webm'})
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `lumina-3d-recording-${Date.now()}.webm`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
            resolve(blob)
        }

        mediaRecorder.onerror = reject

        mediaRecorder.start()
        
        setTimeout(() => {
            mediaRecorder.stop()
        }, duration * 1000)
    })
}

/**
 * Export transaction data to JSON
 * @param {Array} transactions - Array of transactions
 * @param {string} filename - Output filename
 */
export function exportTransactionsJSON(transactions, filename = 'lumina-transactions.json') {
    const data = JSON.stringify(transactions, null, 2)
    const blob = new Blob([data], {type: 'application/json'})
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
 * Export transaction data to CSV
 * @param {Array} transactions - Array of transactions
 * @param {string} filename - Output filename
 */
export function exportTransactionsCSV(transactions, filename = 'lumina-transactions.csv') {
    if (transactions.length === 0) return

    const headers = ['ID', 'Hash', 'Amount (XLM)', 'Fee (XLM)', 'Source', 'Destination', 'Type', 'Ledger', 'Timestamp']
    const rows = transactions.map(tx => [
        tx.id || tx.hash,
        tx.hash || '',
        (tx.amount / 1000000).toFixed(6),
        (tx.fee / 1000000).toFixed(6),
        tx.source || '',
        tx.destination || '',
        tx.isSoroban ? 'Soroban' : tx.isWhale ? 'Whale' : tx.highFee ? 'High Fee' : 'Regular',
        tx.ledger || '',
        tx.created_at || ''
    ])

    const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], {type: 'text/csv'})
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

