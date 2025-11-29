import React, {useState} from 'react'
import './ledger-timestamp-converter.scss'

/**
 * Ledger timestamp conversion tools
 * Converts between ledger sequence and timestamp
 */
export function LedgerTimestampConverter() {
    const [sequence, setSequence] = useState('')
    const [timestamp, setTimestamp] = useState('')
    const [result, setResult] = useState(null)

    // Approximate conversion: 1 ledger per ~5 seconds
    const LEDGER_INTERVAL_SECONDS = 5
    const GENESIS_TIMESTAMP = 1414800000 // Stellar genesis timestamp
    const GENESIS_SEQUENCE = 1

    const sequenceToTimestamp = (seq) => {
        const ledgersSinceGenesis = seq - GENESIS_SEQUENCE
        const secondsSinceGenesis = ledgersSinceGenesis * LEDGER_INTERVAL_SECONDS
        return GENESIS_TIMESTAMP + secondsSinceGenesis
    }

    const timestampToSequence = (ts) => {
        const secondsSinceGenesis = ts - GENESIS_TIMESTAMP
        const ledgersSinceGenesis = Math.floor(secondsSinceGenesis / LEDGER_INTERVAL_SECONDS)
        return GENESIS_SEQUENCE + ledgersSinceGenesis
    }

    const handleSequenceConvert = () => {
        const seq = parseInt(sequence, 10)
        if (!isNaN(seq) && seq > 0) {
            const ts = sequenceToTimestamp(seq)
            const date = new Date(ts * 1000)
            setResult({
                type: 'timestamp',
                value: ts,
                formatted: date.toISOString(),
                local: date.toLocaleString()
            })
        }
    }

    const handleTimestampConvert = () => {
        let ts = timestamp
        // Try to parse as ISO string
        if (timestamp.includes('T') || timestamp.includes('-')) {
            ts = Math.floor(new Date(timestamp).getTime() / 1000)
        } else {
            ts = parseInt(timestamp, 10)
        }

        if (!isNaN(ts) && ts > 0) {
            const seq = timestampToSequence(ts)
            setResult({
                type: 'sequence',
                value: seq,
                formatted: `Ledger ${seq}`
            })
        }
    }

    return (
        <div className="ledger-timestamp-converter">
            <h3>Ledger ↔ Timestamp Converter</h3>
            <p className="converter-note">
                Note: This is an approximate conversion (1 ledger ≈ 5 seconds)
            </p>

            <div className="converter-inputs">
                <div className="converter-section">
                    <label>
                        Ledger Sequence:
                        <input
                            type="number"
                            value={sequence}
                            onChange={(e) => setSequence(e.target.value)}
                            placeholder="Enter ledger sequence"
                        />
                    </label>
                    <button onClick={handleSequenceConvert}>Convert to Timestamp</button>
                </div>

                <div className="converter-divider">↔</div>

                <div className="converter-section">
                    <label>
                        Timestamp (Unix or ISO):
                        <input
                            type="text"
                            value={timestamp}
                            onChange={(e) => setTimestamp(e.target.value)}
                            placeholder="Unix timestamp or ISO date"
                        />
                    </label>
                    <button onClick={handleTimestampConvert}>Convert to Sequence</button>
                </div>
            </div>

            {result && (
                <div className="converter-result">
                    <h4>Result:</h4>
                    <div className="result-value">
                        {result.type === 'timestamp' ? (
                            <>
                                <div><strong>Unix Timestamp:</strong> {result.value}</div>
                                <div><strong>UTC:</strong> {result.formatted}</div>
                                <div><strong>Local:</strong> {result.local}</div>
                            </>
                        ) : (
                            <div><strong>Estimated Ledger:</strong> {result.formatted}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

