import React from 'react'
import ErrorBoundary from '../components/error-boundary'
import NetworkStatsCards from '../components/network-stats-cards'
import LatestLedgersTable from '../components/latest-ledgers-table'
import LatestTransactionsTable from '../components/latest-transactions-table'
import NetworkActivityChart from '../components/network-activity-chart'

export default function HomePage() {
    return <div className="container">
        <div className="segment blank">
            <h1>Lumina - Stellar Network Explorer</h1>
            <p className="dimmed">Real-time blockchain explorer for the Stellar network</p>
            
            <ErrorBoundary>
                <NetworkStatsCards/>
            </ErrorBoundary>
            
            <ErrorBoundary>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <NetworkActivityChart type="transactions" period="24h"/>
                    </div>
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <NetworkActivityChart type="volume" period="24h"/>
                    </div>
                </div>
            </ErrorBoundary>
            
            <div style={{
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '2rem', 
                marginTop: '2rem'
            }}>
                <ErrorBoundary>
                    <div>
                        <h3>Latest Ledgers</h3>
                        <LatestLedgersTable/>
                    </div>
                </ErrorBoundary>
                <ErrorBoundary>
                    <div>
                        <h3>Latest Transactions</h3>
                        <LatestTransactionsTable/>
                    </div>
                </ErrorBoundary>
            </div>
        </div>
    </div>
}