import React, {useState} from 'react'
import './help-documentation.scss'

/**
 * Help documentation component with searchable FAQ and guides
 */
export function HelpDocumentation({className = ''}) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')

    const categories = [
        {id: 'all', name: 'All Topics'},
        {id: 'getting-started', name: 'Getting Started'},
        {id: 'accounts', name: 'Accounts'},
        {id: 'transactions', name: 'Transactions'},
        {id: 'assets', name: 'Assets'},
        {id: 'contracts', name: 'Smart Contracts'},
        {id: '3d-visualization', name: '3D Visualization'},
        {id: 'api', name: 'API'}
    ]

    const documentation = [
        {
            category: 'getting-started',
            title: 'What is Lumina?',
            content: 'Lumina is a modern 3D block explorer for the Stellar network. It provides real-time visualization of transactions, accounts, assets, and smart contracts in an interactive 3D galaxy view.'
        },
        {
            category: 'getting-started',
            title: 'How do I search?',
            content: 'You can search for accounts, transactions, assets, ledgers, and contracts using the search bar. The explorer supports Stellar addresses, transaction hashes, asset codes, and more.'
        },
        {
            category: 'accounts',
            title: 'How do I view account details?',
            content: 'Click on any account address or search for an account. You\'ll see balance history, transaction history, active offers, and account properties.'
        },
        {
            category: 'transactions',
            title: 'What information is shown for transactions?',
            content: 'Transaction details include source account, operations, fees, memo, signatures, effects, and ledger information. You can also view operations in a tree structure.'
        },
        {
            category: 'assets',
            title: 'How do I check asset verification?',
            content: 'Verified assets display a verification badge. You can check asset details, trading pairs, holders, and price history on the asset page.'
        },
        {
            category: 'contracts',
            title: 'How do I interact with smart contracts?',
            content: 'Navigate to a contract address to view its interface, storage, invocation history, and use the function call tool to test contract functions.'
        },
        {
            category: '3d-visualization',
            title: 'How do I use the 3D visualization?',
            content: 'Navigate to /graph/3d to see transactions in real-time. Use mouse/touch to rotate, zoom, and pan. Click on transaction nodes to see details. Use TURBO mode to replay recent transactions.'
        },
        {
            category: '3d-visualization',
            title: 'What do the colors mean in 3D view?',
            content: 'Pink nodes are whale transactions (large amounts), orange are high-fee transactions, cyan are Soroban smart contract transactions, and blue are regular transactions.'
        },
        {
            category: 'api',
            title: 'Is there an API?',
            content: 'Yes! Lumina provides a RESTful API. Check the API documentation at /open-api for endpoints, parameters, and examples.'
        }
    ]

    const filteredDocs = documentation.filter(doc => {
        if (selectedCategory !== 'all' && doc.category !== selectedCategory) return false
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase()
            return doc.title.toLowerCase().includes(searchLower) || 
                   doc.content.toLowerCase().includes(searchLower)
        }
        return true
    })

    return (
        <div className={`help-documentation ${className}`}>
            <div className="help-header">
                <h2>Help & Documentation</h2>
                <div className="help-search">
                    <input
                        type="text"
                        placeholder="Search documentation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="help-content">
                <div className="help-sidebar">
                    <h3>Categories</h3>
                    <div className="category-list">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat.id)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="help-main">
                    {filteredDocs.length === 0 ? (
                        <div className="no-results">
                            No documentation found matching your search.
                        </div>
                    ) : (
                        filteredDocs.map((doc, index) => (
                            <div key={index} className="doc-item">
                                <h3 className="doc-title">{doc.title}</h3>
                                <div className="doc-content">{doc.content}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

