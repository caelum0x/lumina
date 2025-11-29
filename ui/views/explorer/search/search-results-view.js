import React, {useState} from 'react'
import {Federation} from '@stellar/stellar-sdk'
import {useDependantState, usePageMetadata} from '@stellar-expert/ui-framework'
import {navigation} from '@stellar-expert/navigation'
import appSettings from '../../../app-settings'
import {detectSearchType} from '../../../business-logic/search'
import {resolvePath} from '../../../business-logic/path'
import smartSearch from '../../../business-logic/ai/smart-search'
import ErrorNotificationBlock from '../../components/error-notification-block'
import AssetSearchResultsView from './assets-search-results-view'
import AccountSearchResultsView from './account-search-results-view'
import LedgerSearchResultsView from './ledger-search-results-view'
import OperationSearchResultsView from './operation-search-results-view'
import TransactionSearchResultsView from './transaction-search-results-view'
import OfferSearchResultsView from './offer-search-results-view'
import ContractSearchResultsView from './contract-search-results-view'
import './search.scss'

/**
 * @typedef {Object} SearchResult
 * @property {String} link
 * @property {Object} title
 * @property {Object} description
 * @property {Object} links
 */

const searchTypesMapping = [
    {keys: ['transaction'], component: TransactionSearchResultsView},
    {keys: ['operation'], component: OperationSearchResultsView},
    {keys: ['offer'], component: OfferSearchResultsView},
    {keys: ['ledger'], component: LedgerSearchResultsView},
    {keys: ['account'], component: AccountSearchResultsView},
    {keys: ['contract'], component: ContractSearchResultsView},
    {keys: ['asset', 'account'], component: AssetSearchResultsView}
]

async function processSearchTerm(originalTerm) {
    let term = originalTerm
    try {
        let searchTypes = detectSearchType(originalTerm)
        //resolve federation address
        if (searchTypes[0] === 'federation') {
            const {account_id} = await Federation.Server.resolve(originalTerm)
            term = account_id
            searchTypes = ['account']
        } else if (searchTypes[0] === 'sorobandomains') {
            const resolved = await fetch(`https://sorobandomains-query.lightsail.network/api/v1/query?q=${originalTerm.trim().toLowerCase()}&type=domain`)
                .then(res => res.json())
            if (resolved?.address) {
                term = resolved.address
                searchTypes = ['account']
            }
        }
        return {term, originalTerm, searchTypes, error: null}

    } catch (e) {
        console.error(e)
        return {term, results: [], error: `Nothing found for search term "${term}".`}
    }
}

function SearchResults({term, searchTypes, originalTerm}) {
    const [notFound, setNotFound] = useState(null)
    const [componentsToRender] = useDependantState(() => {
        const loading = []
        const components = []
        for (const {component} of searchTypesMapping.filter(st => st.keys.some(key => searchTypes.includes(key)))) {
            let onLoaded
            loading.push(new Promise(resolve => {
                onLoaded = resolve
            }))
            components.push(React.createElement(component, {term, onLoaded}))
        }
        if (!loading.length) {
            setNotFound(true)
        }
        Promise.all(loading)
            .then(allResults => {
                const nonEmpty = allResults.flat().filter(res => !!res)
                switch (nonEmpty.length) {
                    case 0:
                        setNotFound(true)
                        break
                    case 1:
                        navigation.navigate(nonEmpty[0].link) //navigate to the default result
                        break
                    default:
                        setNotFound(false)
                        break
                }
            })
        return components
    }, [term, searchTypes])

    return <div style={{minHeight: '40vh'}}>
        {componentsToRender}
        {typeof notFound !== 'boolean' && <div className="loader"/>}
        {!!notFound && <div className="segment blank">
            <div className="notfound text-center double-space dimmed">
                <h3>No results found for "{originalTerm}"</h3>
            </div>
            <div className="space">
                <h4>Search suggestions:</h4>
                <ul className="text-small">
                    <li>For <b>assets</b>: Try "XLM", "USDC", "AQUA" or partial names like "USD"</li>
                    <li>For <b>accounts</b>: Use full address starting with "G" (56 characters)</li>
                    <li>For <b>transactions</b>: Use full transaction hash (64 hex characters)</li>
                    <li>For <b>ledgers</b>: Use ledger sequence number</li>
                    <li>For <b>contracts</b>: Use contract address starting with "C" (56 characters)</li>
                    <li>For <b>federation</b>: Use format "name*domain.com"</li>
                    <li>For <b>Soroban domains</b>: Use format "name.xlm"</li>
                </ul>
            </div>
            <div className="space text-center">
                <a href={resolvePath('')} className="button">Back to Explorer</a>
            </div>
        </div>}
    </div>
}

function SearchResultsWrapper({originalTerm, children}) {
    const parsedQuery = smartSearch.parseQuery(originalTerm)
    const [suggestions, setSuggestions] = React.useState([])
    
    React.useEffect(() => {
        // Get smart search suggestions
        const searchSuggestions = smartSearch.getSuggestions(originalTerm)
        setSuggestions(searchSuggestions.slice(0, 5)) // Limit to 5 suggestions
    }, [originalTerm])
    
    return <div className="search container narrow">
        <h2 className="text-overflow">Search results for "{originalTerm}"</h2>
        {parsedQuery.type !== 'general' && (
            <div className="ai-search-info segment blank" style={{marginBottom: '1em', padding: '0.8em'}}>
                <div className="dimmed" style={{fontSize: '0.9em'}}>
                    <strong>🤖 AI Analysis:</strong> Detected search type: <span className="highlight">{parsedQuery.type}</span>
                    {parsedQuery.entities.accounts.length > 0 && (
                        <span> • {parsedQuery.entities.accounts.length} account{parsedQuery.entities.accounts.length > 1 ? 's' : ''} found</span>
                    )}
                    {parsedQuery.entities.amounts.length > 0 && (
                        <span> • Amount filter: {parsedQuery.entities.amounts[0].value} {parsedQuery.entities.amounts[0].unit}</span>
                    )}
                    {parsedQuery.entities.assets.length > 0 && (
                        <span> • {parsedQuery.entities.assets.length} asset{parsedQuery.entities.assets.length > 1 ? 's' : ''} detected</span>
                    )}
                </div>
            </div>
        )}
        {suggestions.length > 0 && (
            <div className="search-suggestions segment blank" style={{marginBottom: '1em', padding: '0.8em'}}>
                <div className="dimmed" style={{fontSize: '0.9em', marginBottom: '0.5em'}}>
                    <strong>💡 Search Suggestions:</strong>
                </div>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5em'}}>
                    {suggestions.map((suggestion, index) => (
                        <a
                            key={index}
                            href={`/search?term=${encodeURIComponent(suggestion)}`}
                            className="suggestion-tag"
                            style={{
                                padding: '0.3em 0.8em',
                                background: 'rgba(0, 240, 255, 0.1)',
                                border: '1px solid rgba(0, 240, 255, 0.3)',
                                borderRadius: '4px',
                                color: '#00f0ff',
                                textDecoration: 'none',
                                fontSize: '0.85em',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(0, 240, 255, 0.2)'
                                e.target.style.transform = 'translateY(-2px)'
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(0, 240, 255, 0.1)'
                                e.target.style.transform = 'translateY(0)'
                            }}
                        >
                            {suggestion}
                        </a>
                    ))}
                </div>
            </div>
        )}
        {children}
    </div>
}

export default function SearchResultsView() {
    const originalTerm = (navigation.query.term || '').trim()
    usePageMetadata({
        title: `Search "${originalTerm}"`,
        description: `Search results for term "${originalTerm}" on Stellar ${appSettings.activeNetwork} network.`
    })

    const [state, setState] = useDependantState(() => {
        processSearchTerm(originalTerm)
            .then(newState => setState(newState))

        return {
            searchTypes: [],
            term: '',
            originalTerm: '',
            error: null,
            inProgress: true
        }
    }, [originalTerm])

    if (state.error)
        return <SearchResultsWrapper originalTerm={originalTerm}>
            <ErrorNotificationBlock>{state.error}</ErrorNotificationBlock>
        </SearchResultsWrapper>

    if (state.inProgress)
        return <div className="loader"/>

    if (!originalTerm)
        return <SearchResultsWrapper originalTerm={originalTerm}>
            <div className="text-center dimmed">(no search term provided)</div>
        </SearchResultsWrapper>

    return <SearchResultsWrapper originalTerm={originalTerm}>
        <SearchResults {...state}/>
        <div className="space segment blank">
            <h3>Not found what you've been looking for?</h3>
            <hr className="flare"/>
            <div className="row">
                <div className="column column-66 space">
                    <div className="dimmed">
                        Search suggestions:
                    </div>
                    <ul className="list checked">
                        <li>Verify that you copied/typed text correctly.</li>
                        <li>Search by asset, account, transaction hash, operation id, or ledger sequence.</li>
                        <li>Check spelling and reduce the number of searched terms.</li>
                        <li>Try related terms, like ledger sequence or account address.</li>
                    </ul>
                </div>
                <div className="column column-33 space">
                    <div className="dimmed">Or navigate directly to:</div>
                    <div className="micro-space"/>
                    <div className="row">
                        <div className="column column-50">
                            <a href={resolvePath('asset')}>Assets Dashboard</a><br/>
                            <a href={resolvePath('market')}>Markets Dashboard</a><br/>
                            <a href={resolvePath('network-activity')}>Network Stats</a>
                        </div>
                        <div className="column column-50">
                            <a href={resolvePath('', 'directory')}>Accounts Directory</a><br/>
                            <a href={resolvePath('payment-locator')}>Payment Locator</a><br/>
                            <a href={resolvePath('tax-export')}>Tax Data Export</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </SearchResultsWrapper>
}