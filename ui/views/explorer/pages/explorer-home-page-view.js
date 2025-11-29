import React from 'react'
import {usePageMetadata} from '@stellar-expert/ui-framework'
import appSettings from '../../../app-settings'
import CrawlerScreen from '../../components/crawler-screen'
import LedgerActivity from '../ledger/ledger-activity-view'
import LatestLedgersTable from '../ledger/latest-ledgers-table'
import LatestTransactionsTable from '../transaction/latest-transactions-table'
import FeeAnalyticsWidget from '../ledger/fee-analytics-widget'

export default function ExplorerHomePageView() {
    if (!appSettings.activeNetwork)
        return null
    usePageMetadata({
        title: `Lumina - Stellar ${appSettings.activeNetwork} Network Explorer`,
        description: `Real-time Stellar blockchain explorer. Track transactions, accounts, assets, and smart contracts on the Stellar ${appSettings.activeNetwork} network.`
    })
    return <div>
        <div className="space text-center">
            <h1>Stellar Network Explorer</h1>
            <p className="text-small dimmed">Real-time blockchain data and analytics</p>
        </div>
        <div className="space"/>
        <div className="row">
            <div className="column column-50">
                <CrawlerScreen>
                    <LedgerActivity title="Network Activity"/>
                </CrawlerScreen>
            </div>
            <div className="space mobile-only"/>
            <div className="column column-50">
                <LatestLedgersTable/>
                <div className="space"/>
                <FeeAnalyticsWidget/>
            </div>
        </div>
        <div className="space"/>
        <div className="row">
            <div className="column column-100">
                <LatestTransactionsTable/>
            </div>
        </div>
    </div>
}