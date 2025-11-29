import React, {useState, useEffect} from 'react'
import appSettings from '../../app-settings'

export default function NetworkStatsCards() {
    const [stats, setStats] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetch(`${appSettings.apiEndpoint}/explorer/${appSettings.activeNetwork}/network/stats`)
            .then(r => r.ok ? r.json() : Promise.reject('Failed to load'))
            .then(setStats)
            .catch(setError)
    }, [])

    if (error) return <div className="dimmed text-center">Failed to load network stats. <a href="#" onClick={() => window.location.reload()}>Retry</a></div>
    if (!stats) return <div className="loader"/>

    return <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem'}}>
        <StatCard title="Current Ledger" value={stats.currentLedger || 'N/A'}/>
        <StatCard title="TPS" value={stats.tps || '0'}/>
        <StatCard title="Fee (stroops)" value="100"/>
    </div>
}

function StatCard({title, value}) {
    return <div style={{
        padding: '1.5rem',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)'
    }}>
        <div className="dimmed text-small">{title}</div>
        <div style={{fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.5rem'}}>{value}</div>
    </div>
}
