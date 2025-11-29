import React from 'react'
import {csvGenerate} from '../../../util/csv-generator'
import './account-export-csv.scss'

/**
 * CSV export component for account data
 */
export function AccountExportCSV({accountData, transactions, balances, filename = 'account-data'}) {
    const exportToCSV = (data, type) => {
        if (!data || data.length === 0) {
            alert('No data to export')
            return
        }

        let csvData = []
        let csvFilename = filename

        switch (type) {
            case 'transactions':
                csvData = transactions.map(tx => ({
                    'Hash': tx.hash || tx.id,
                    'Date': tx.created_at ? new Date(tx.created_at).toISOString() : '',
                    'Source': tx.source_account || '',
                    'Amount': tx.amount ? (tx.amount / 1000000).toFixed(6) : '0',
                    'Fee': tx.fee_charged ? (tx.fee_charged / 1000000).toFixed(6) : '0',
                    'Status': tx.successful ? 'Success' : 'Failed',
                    'Ledger': tx.ledger || ''
                }))
                csvFilename = `${filename}-transactions`
                break

            case 'balances':
                csvData = balances.map(balance => ({
                    'Asset': balance.asset_code || 'XLM',
                    'Issuer': balance.asset_issuer || 'Native',
                    'Balance': balance.balance || '0',
                    'Limit': balance.limit || '0'
                }))
                csvFilename = `${filename}-balances`
                break

            case 'summary':
                csvData = [{
                    'Account': accountData?.address || '',
                    'Balance': accountData?.balance || '0',
                    'Sequence': accountData?.sequence || '0',
                    'Subentry Count': accountData?.subentry_count || '0',
                    'Flags': accountData?.flags || '0'
                }]
                csvFilename = `${filename}-summary`
                break

            default:
                return
        }

        const csv = csvGenerate(csvData)
        const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'})
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        
        link.setAttribute('href', url)
        link.setAttribute('download', `${csvFilename}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="account-export-csv">
            <h3>Export Data</h3>
            <div className="export-buttons">
                {transactions && transactions.length > 0 && (
                    <button
                        className="export-btn"
                        onClick={() => exportToCSV(transactions, 'transactions')}
                    >
                        Export Transactions ({transactions.length})
                    </button>
                )}
                {balances && balances.length > 0 && (
                    <button
                        className="export-btn"
                        onClick={() => exportToCSV(balances, 'balances')}
                    >
                        Export Balances ({balances.length})
                    </button>
                )}
                {accountData && (
                    <button
                        className="export-btn"
                        onClick={() => exportToCSV(accountData, 'summary')}
                    >
                        Export Summary
                    </button>
                )}
            </div>
        </div>
    )
}

