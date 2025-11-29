import React, {useState} from 'react'
import SearchBoxView from './search-box-view'
import AISearchButton from '../../components/ai-search-button'
import {usePageMetadata} from '@stellar-expert/ui-framework'

function SearchExample({term, children}) {
    return <a href={location.pathname + '?search=' + term} onClick={() => {
        setTimeout(() => {
            document.querySelector('.search-box.primary input')
                .focus()
        }, 300)
    }}>{children}</a>
}

export default function DedicatedSearchBoxView() {
    const [searchQuery, setSearchQuery] = useState('')
    
    usePageMetadata({
        title: `Search`,
        description: `Search for any information on Stellar Network: tokens, accounts, ledgers, transactions, operations, offers, markets, and more.`
    })
    
    return <div className="container narrow">
        <h2>Search</h2>
        <div className="segment blank">
            <div className="dimmed text-small text-center">
                Search for any information on Stellar Network: tokens, accounts, ledgers,
                transactions, operations, offers, markets, and more.
            </div>
            <div className="space"/>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <div style={{flex: 1}}>
                    <SearchBoxView 
                        shrinkable={false} 
                        className="primary"
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <AISearchButton query={searchQuery} results={{}} />
            </div>
            <p className="text-small dimmed text-center">
                for example, try typing <SearchExample term="USD">USD</SearchExample>,{' '}
                <SearchExample term="4651470">4651470</SearchExample>, or{' '}
                <SearchExample term="GA5XIGA5C7QTPTWXQHY6MCJRMTRZDOSHR6EFIBNDQTCQHG262N4GGKTM">GA5X...GKTM</SearchExample>
            </p>
            <div className="double-space"/>
        </div>
    </div>
}