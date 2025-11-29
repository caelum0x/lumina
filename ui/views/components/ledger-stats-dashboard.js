import React, {useMemo} from 'react'
import './ledger-stats-dashboard.scss'

/**
 * Ledger statistics dashboard showing network health metrics
 */
export function LedgerStatsDashboard({ledgerStats, currentLedger}) {
    const stats = useMemo(() => {
        if (!ledgerStats) return null

        return {
            totalTransactions: ledgerStats.total_transactions || 0,
            totalOperations: ledgerStats.total_operations || 0,
            avgTxPerLedger: ledgerStats.avg_tx_per_ledger || 0,
            avgOpPerTx: ledgerStats.avg_op_per_tx || 0,
            totalAccounts: ledgerStats.total_accounts || 0,
            totalAssets: ledgerStats.total_assets || 0,
            totalTrustlines: ledgerStats.total_trustlines || 0,
            totalXLM: ledgerStats.total_xlm || 0
        }
    }, [ledgerStats])

    if (!stats) {
        return <div className="stats-loading">Loading ledger statistics...</div>
    }

    return (
        <div className="ledger-stats-dashboard">
            <h3>Network Statistics</h3>
            {currentLedger && (
                <div className="current-ledger">
                    Current Ledger: <strong>{currentLedger}</strong>
                </div>
            )}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Transactions</div>
                    <div className="stat-value">{stats.totalTransactions.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Operations</div>
                    <div className="stat-value">{stats.totalOperations.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Avg Tx/Ledger</div>
                    <div className="stat-value">{stats.avgTxPerLedger.toFixed(1)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Avg Op/Tx</div>
                    <div className="stat-value">{stats.avgOpPerTx.toFixed(1)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Accounts</div>
                    <div className="stat-value">{stats.totalAccounts.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Assets</div>
                    <div className="stat-value">{stats.totalAssets.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Trustlines</div>
                    <div className="stat-value">{stats.totalTrustlines.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total XLM</div>
                    <div className="stat-value">{(stats.totalXLM / 10000000).toFixed(0)}</div>
                </div>
            </div>
        </div>
    )
}

