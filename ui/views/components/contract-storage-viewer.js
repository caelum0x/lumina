import React, {useState} from 'react'
import {ScVal} from '@stellar-expert/ui-framework'
import './contract-storage-viewer.scss'

/**
 * Contract storage data viewer with filtering and search
 */
export function ContractStorageViewer({storageEntries, contractAddress}) {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('all')

    const filteredEntries = React.useMemo(() => {
        if (!storageEntries || !Array.isArray(storageEntries)) return []

        return storageEntries.filter(entry => {
            // Search filter
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase()
                const keyMatch = entry.key?.toLowerCase().includes(searchLower)
                const valueMatch = JSON.stringify(entry.value).toLowerCase().includes(searchLower)
                if (!keyMatch && !valueMatch) return false
            }

            // Type filter
            if (filterType !== 'all') {
                if (entry.durability !== filterType) return false
            }

            return true
        })
    }, [storageEntries, searchTerm, filterType])

    return (
        <div className="contract-storage-viewer">
            <div className="viewer-header">
                <h3>Contract Storage</h3>
                <div className="viewer-controls">
                    <input
                        type="text"
                        placeholder="Search storage..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Types</option>
                        <option value="temporary">Temporary</option>
                        <option value="persistent">Persistent</option>
                    </select>
                </div>
            </div>

            <div className="storage-entries">
                {filteredEntries.length === 0 ? (
                    <div className="no-entries">No storage entries found</div>
                ) : (
                    filteredEntries.map((entry, index) => (
                        <div key={index} className="storage-entry">
                            <div className="entry-header">
                                <div className="entry-key">
                                    <strong>Key:</strong> {entry.key || '(empty key)'}
                                </div>
                                <div className="entry-type">
                                    {entry.durability || 'unknown'}
                                </div>
                            </div>
                            <div className="entry-value">
                                <strong>Value:</strong>
                                <div className="value-display">
                                    <ScVal value={entry.value} />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

