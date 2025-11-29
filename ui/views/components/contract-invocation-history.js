import React, {useState} from 'react'
import {AccountAddress, UtcTimestamp} from '@stellar-expert/ui-framework'
import {VirtualScroll} from './virtual-scroll'
import {TimeRangeSelector, useTimeRange} from './time-range-selector'
import './contract-invocation-history.scss'

/**
 * Detailed contract invocation history with filters
 */
export function ContractInvocationHistory({invocations, contractAddress}) {
    const [timeRange, setTimeRange] = useState('30d')
    const [functionFilter, setFunctionFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const {startTime} = useTimeRange(timeRange)

    // Get unique function names
    const functions = React.useMemo(() => {
        if (!invocations) return []
        const funcSet = new Set()
        invocations.forEach(inv => {
            if (inv.function) funcSet.add(inv.function)
        })
        return Array.from(funcSet)
    }, [invocations])

    const filteredInvocations = React.useMemo(() => {
        if (!invocations || !Array.isArray(invocations)) return []

        return invocations.filter(inv => {
            // Time filter
            if (startTime && inv.timestamp) {
                const invTime = new Date(inv.timestamp).getTime()
                if (invTime < startTime) return false
            }

            // Function filter
            if (functionFilter !== 'all' && inv.function !== functionFilter) {
                return false
            }

            // Status filter
            if (statusFilter !== 'all') {
                if (statusFilter === 'success' && !inv.success) return false
                if (statusFilter === 'failed' && inv.success) return false
            }

            return true
        })
    }, [invocations, startTime, functionFilter, statusFilter])

    const renderInvocation = (inv, index) => {
        return (
            <div className="invocation-item">
                <div className="invocation-header">
                    <div className="invocation-function">
                        <span className="function-name">{inv.function || 'Unknown'}</span>
                        <span className={`invocation-status ${inv.success ? 'success' : 'failed'}`}>
                            {inv.success ? '✓ Success' : '✗ Failed'}
                        </span>
                    </div>
                    <div className="invocation-timestamp">
                        {inv.timestamp && <UtcTimestamp date={inv.timestamp} />}
                    </div>
                </div>
                <div className="invocation-details">
                    <div className="detail-row">
                        <span className="detail-label">Caller:</span>
                        <span className="detail-value">
                            <AccountAddress account={inv.caller || inv.source_account} chars={12} />
                        </span>
                    </div>
                    {inv.parameters && (
                        <div className="detail-row">
                            <span className="detail-label">Parameters:</span>
                            <span className="detail-value">
                                <pre>{JSON.stringify(inv.parameters, null, 2)}</pre>
                            </span>
                        </div>
                    )}
                    {inv.result && (
                        <div className="detail-row">
                            <span className="detail-label">Result:</span>
                            <span className="detail-value">
                                <pre>{JSON.stringify(inv.result, null, 2)}</pre>
                            </span>
                        </div>
                    )}
                    {inv.fee && (
                        <div className="detail-row">
                            <span className="detail-label">Fee:</span>
                            <span className="detail-value">
                                {(inv.fee / 1000000).toFixed(6)} XLM
                            </span>
                        </div>
                    )}
                    {inv.tx_hash && (
                        <div className="detail-row">
                            <span className="detail-label">Transaction:</span>
                            <span className="detail-value">
                                <a href={`/explorer/public/tx/${inv.tx_hash}`}>
                                    {inv.tx_hash.substring(0, 16)}...
                                </a>
                            </span>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="contract-invocation-history">
            <div className="history-header">
                <h3>Invocation History ({filteredInvocations.length})</h3>
                <div className="history-controls">
                    <TimeRangeSelector
                        onChange={setTimeRange}
                        defaultRange={timeRange}
                    />
                    {functions.length > 0 && (
                        <select
                            value={functionFilter}
                            onChange={(e) => setFunctionFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Functions</option>
                            {functions.map(func => (
                                <option key={func} value={func}>{func}</option>
                            ))}
                        </select>
                    )}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Status</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
            </div>

            <VirtualScroll
                items={filteredInvocations}
                itemHeight={150}
                containerHeight={600}
                renderItem={renderInvocation}
            />
        </div>
    )
}

