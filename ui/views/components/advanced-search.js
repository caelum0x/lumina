import React, {useState} from 'react'
import {useHistory} from 'react-router'
import {TimeRangeSelector, useTimeRange} from './time-range-selector'
import './advanced-search.scss'

/**
 * Advanced search with multiple criteria
 */
export function AdvancedSearch({onSearch, className = ''}) {
    const history = useHistory()
    const [searchCriteria, setSearchCriteria] = useState({
        type: 'all',
        dateFrom: '',
        dateTo: '',
        amountMin: '',
        amountMax: '',
        network: 'public',
        account: '',
        asset: ''
    })

    const handleChange = (field, value) => {
        setSearchCriteria(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSearch = () => {
        const params = new URLSearchParams()
        
        if (searchCriteria.type !== 'all') {
            params.append('type', searchCriteria.type)
        }
        if (searchCriteria.dateFrom) {
            params.append('dateFrom', searchCriteria.dateFrom)
        }
        if (searchCriteria.dateTo) {
            params.append('dateTo', searchCriteria.dateTo)
        }
        if (searchCriteria.amountMin) {
            params.append('amountMin', searchCriteria.amountMin)
        }
        if (searchCriteria.amountMax) {
            params.append('amountMax', searchCriteria.amountMax)
        }
        if (searchCriteria.account) {
            params.append('account', searchCriteria.account)
        }
        if (searchCriteria.asset) {
            params.append('asset', searchCriteria.asset)
        }

        const queryString = params.toString()
        const url = `/explorer/${searchCriteria.network}/search?${queryString}`
        
        if (onSearch) {
            onSearch(searchCriteria)
        } else {
            history.push(url)
        }
    }

    return (
        <div className={`advanced-search ${className}`}>
            <h3>Advanced Search</h3>
            <div className="search-form">
                <div className="form-row">
                    <label>
                        Type:
                        <select
                            value={searchCriteria.type}
                            onChange={(e) => handleChange('type', e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="transaction">Transaction</option>
                            <option value="account">Account</option>
                            <option value="asset">Asset</option>
                            <option value="ledger">Ledger</option>
                            <option value="contract">Contract</option>
                        </select>
                    </label>
                </div>

                <div className="form-row">
                    <label>
                        Date From:
                        <input
                            type="date"
                            value={searchCriteria.dateFrom}
                            onChange={(e) => handleChange('dateFrom', e.target.value)}
                        />
                    </label>
                    <label>
                        Date To:
                        <input
                            type="date"
                            value={searchCriteria.dateTo}
                            onChange={(e) => handleChange('dateTo', e.target.value)}
                        />
                    </label>
                </div>

                <div className="form-row">
                    <label>
                        Amount Min (XLM):
                        <input
                            type="number"
                            value={searchCriteria.amountMin}
                            onChange={(e) => handleChange('amountMin', e.target.value)}
                            placeholder="0"
                        />
                    </label>
                    <label>
                        Amount Max (XLM):
                        <input
                            type="number"
                            value={searchCriteria.amountMax}
                            onChange={(e) => handleChange('amountMax', e.target.value)}
                            placeholder="1000000"
                        />
                    </label>
                </div>

                <div className="form-row">
                    <label>
                        Account:
                        <input
                            type="text"
                            value={searchCriteria.account}
                            onChange={(e) => handleChange('account', e.target.value)}
                            placeholder="G..."
                        />
                    </label>
                    <label>
                        Asset:
                        <input
                            type="text"
                            value={searchCriteria.asset}
                            onChange={(e) => handleChange('asset', e.target.value)}
                            placeholder="USD"
                        />
                    </label>
                </div>

                <div className="form-row">
                    <label>
                        Network:
                        <select
                            value={searchCriteria.network}
                            onChange={(e) => handleChange('network', e.target.value)}
                        >
                            <option value="public">Public</option>
                            <option value="testnet">Testnet</option>
                        </select>
                    </label>
                </div>

                <div className="form-actions">
                    <button
                        className="search-button"
                        onClick={handleSearch}
                    >
                        Search
                    </button>
                    <button
                        className="reset-button"
                        onClick={() => {
                            setSearchCriteria({
                                type: 'all',
                                dateFrom: '',
                                dateTo: '',
                                amountMin: '',
                                amountMax: '',
                                network: 'public',
                                account: '',
                                asset: ''
                            })
                        }}
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    )
}

