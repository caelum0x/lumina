import React, {useState, useMemo} from 'react'
import {StrKey} from '@stellar/stellar-base'
import './tx-memo-decoder.scss'

/**
 * Transaction memo decoder and display component
 * Handles text, ID, hash, and return memo types
 */
export function TxMemoDecoder({memo, memoType}) {
    const [decoded, setDecoded] = useState(null)
    const [error, setError] = useState(null)

    const memoTypes = {
        'text': 'Text',
        'id': 'ID',
        'hash': 'Hash',
        'return': 'Return',
        'none': 'None'
    }

    const decodeMemo = useMemo(() => {
        if (!memo || !memoType || memoType === 'none') {
            return {type: 'none', value: null, display: 'No memo'}
        }

        try {
            switch (memoType) {
                case 'text':
                    return {
                        type: 'text',
                        value: memo,
                        display: memo,
                        raw: memo
                    }

                case 'id':
                    return {
                        type: 'id',
                        value: memo,
                        display: `ID: ${memo}`,
                        raw: memo
                    }

                case 'hash':
                    const hashHex = Buffer.from(memo, 'base64').toString('hex')
                    return {
                        type: 'hash',
                        value: memo,
                        display: `Hash: ${hashHex}`,
                        raw: hashHex,
                        base64: memo
                    }

                case 'return':
                    const returnHex = Buffer.from(memo, 'base64').toString('hex')
                    return {
                        type: 'return',
                        value: memo,
                        display: `Return: ${returnHex}`,
                        raw: returnHex,
                        base64: memo
                    }

                default:
                    return {
                        type: 'unknown',
                        value: memo,
                        display: `Unknown type: ${memo}`,
                        raw: memo
                    }
            }
        } catch (e) {
            setError(`Failed to decode memo: ${e.message}`)
            return {
                type: 'error',
                value: memo,
                display: `Error decoding memo`,
                raw: memo
            }
        }
    }, [memo, memoType])

    if (!memo || memoType === 'none') {
        return (
            <div className="memo-decoder">
                <div className="memo-type">No Memo</div>
            </div>
        )
    }

    return (
        <div className="memo-decoder">
            <div className="memo-header">
                <span className="memo-type-label">Memo Type:</span>
                <span className="memo-type">{memoTypes[memoType] || memoType}</span>
            </div>
            <div className="memo-content">
                <div className="memo-display">
                    {decodeMemo.display}
                </div>
                {(decodeMemo.raw || decodeMemo.base64) && (
                    <div className="memo-details">
                        {decodeMemo.raw && (
                            <div className="memo-raw">
                                <span className="memo-label">Raw (Hex):</span>
                                <code>{decodeMemo.raw}</code>
                            </div>
                        )}
                        {decodeMemo.base64 && (
                            <div className="memo-base64">
                                <span className="memo-label">Base64:</span>
                                <code>{decodeMemo.base64}</code>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {error && (
                <div className="memo-error">
                    ⚠️ {error}
                </div>
            )}
        </div>
    )
}

