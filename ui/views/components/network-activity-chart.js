import React, {useState, useEffect} from 'react'
import appSettings from '../../app-settings'

export default function NetworkActivityChart({period = '24h', type = 'transactions'}) {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const endpoint = type === 'volume' ? 'chart/volume' : 'chart/transactions'
        fetch(`${appSettings.apiEndpoint}/explorer/${appSettings.activeNetwork}/${endpoint}?period=${period}`)
            .then(r => r.json())
            .then(result => {
                setData(result.data || [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [period, type])

    if (loading) return <div className="loader"/>
    if (data.length === 0) return <div className="dimmed text-center">No data available</div>

    const max = Math.max(...data.map(d => d.value))
    const min = Math.min(...data.map(d => d.value))
    const range = max - min || 1

    return <div style={{position: 'relative', height: '200px', padding: '1rem'}}>
        <div style={{display: 'flex', alignItems: 'flex-end', height: '100%', gap: '2px'}}>
            {data.map((d, i) => {
                const height = ((d.value - min) / range) * 100
                return <div
                    key={i}
                    style={{
                        flex: 1,
                        height: `${height}%`,
                        background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                        minHeight: '2px',
                        borderRadius: '2px 2px 0 0'
                    }}
                    title={`${d.value} ${type}`}
                />
            })}
        </div>
        <div className="text-small dimmed text-center" style={{marginTop: '0.5rem'}}>
            {type === 'volume' ? 'Operations' : 'Transactions'} - Last {period}
        </div>
    </div>
}
