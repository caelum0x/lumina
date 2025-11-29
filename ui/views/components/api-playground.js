import React, {useState} from 'react'
import './api-playground.scss'

const endpoints = [
    {name: 'Get Transaction', method: 'GET', path: '/explorer/:network/tx/:hash', params: {network: 'public', hash: ''}},
    {name: 'Get Account', method: 'GET', path: '/explorer/:network/account/:address', params: {network: 'public', address: ''}},
    {name: 'Get Asset', method: 'GET', path: '/explorer/:network/asset/:asset', params: {network: 'public', asset: ''}},
    {name: 'Search', method: 'GET', path: '/explorer/:network/search', params: {network: 'public'}, query: {q: ''}},
    {name: 'Ledger Stats', method: 'GET', path: '/explorer/:network/ledger/ledger-stats', params: {network: 'public'}},
    {name: 'Contract Info', method: 'GET', path: '/explorer/:network/contract/:address', params: {network: 'public', address: ''}}
]

export function APIPlayground() {
    const [selected, setSelected] = useState(endpoints[0])
    const [params, setParams] = useState(selected.params)
    const [query, setQuery] = useState(selected.query || {})
    const [response, setResponse] = useState(null)
    const [loading, setLoading] = useState(false)

    const buildUrl = () => {
        let url = selected.path
        Object.entries(params).forEach(([key, val]) => {
            url = url.replace(`:${key}`, val || `:${key}`)
        })
        const queryStr = new URLSearchParams(query).toString()
        return url + (queryStr ? `?${queryStr}` : '')
    }

    const execute = async () => {
        setLoading(true)
        setResponse(null)
        try {
            const apiUrl = window.explorerApiOrigin || 'http://localhost:3000'
            const res = await fetch(apiUrl + buildUrl())
            const data = await res.json()
            setResponse({status: res.status, data})
        } catch (err) {
            setResponse({error: err.message})
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="api-playground">
            <h2>API Playground</h2>
            
            <div className="endpoint-selector">
                {endpoints.map((ep, i) => (
                    <button key={i} 
                            className={selected === ep ? 'active' : ''}
                            onClick={() => {
                                setSelected(ep)
                                setParams(ep.params)
                                setQuery(ep.query || {})
                                setResponse(null)
                            }}>
                        {ep.name}
                    </button>
                ))}
            </div>

            <div className="request-builder">
                <div className="method-path">
                    <span className="method">{selected.method}</span>
                    <code>{buildUrl()}</code>
                </div>

                <div className="params">
                    <h4>Parameters</h4>
                    {Object.keys(params).map(key => (
                        <div key={key} className="param-input">
                            <label>{key}</label>
                            <input value={params[key]} 
                                   onChange={e => setParams({...params, [key]: e.target.value})}
                                   placeholder={key} />
                        </div>
                    ))}
                </div>

                {selected.query && (
                    <div className="params">
                        <h4>Query Parameters</h4>
                        {Object.keys(query).map(key => (
                            <div key={key} className="param-input">
                                <label>{key}</label>
                                <input value={query[key]} 
                                       onChange={e => setQuery({...query, [key]: e.target.value})}
                                       placeholder={key} />
                            </div>
                        ))}
                    </div>
                )}

                <button className="execute-btn" onClick={execute} disabled={loading}>
                    {loading ? 'Loading...' : 'Execute'}
                </button>
            </div>

            {response && (
                <div className="response-viewer">
                    <h4>Response {response.status && `(${response.status})`}</h4>
                    <pre>{JSON.stringify(response.data || response.error, null, 2)}</pre>
                </div>
            )}
        </div>
    )
}
