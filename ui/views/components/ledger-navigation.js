import React from 'react'
import {useHistory, useParams} from 'react-router'
import './ledger-navigation.scss'

/**
 * Ledger sequence navigation component (prev/next, jump to sequence)
 */
export function LedgerNavigation({currentSequence, minSequence = 1, maxSequence}) {
    const history = useHistory()
    const {network} = useParams() || {}
    const networkPath = network || 'public'

    const goToSequence = (sequence) => {
        if (sequence >= minSequence && (!maxSequence || sequence <= maxSequence)) {
            history.push(`/explorer/${networkPath}/ledger/${sequence}`)
        }
    }

    const goToPrev = () => {
        if (currentSequence > minSequence) {
            goToSequence(currentSequence - 1)
        }
    }

    const goToNext = () => {
        if (!maxSequence || currentSequence < maxSequence) {
            goToSequence(currentSequence + 1)
        }
    }

    const handleJumpTo = (e) => {
        e.preventDefault()
        const input = e.target.querySelector('input[type="number"]')
        if (input) {
            const sequence = parseInt(input.value, 10)
            if (!isNaN(sequence)) {
                goToSequence(sequence)
            }
        }
    }

    return (
        <div className="ledger-navigation">
            <button
                className="nav-button prev"
                onClick={goToPrev}
                disabled={currentSequence <= minSequence}
                title="Previous ledger"
            >
                ← Prev
            </button>
            
            <form onSubmit={handleJumpTo} className="jump-to-form">
                <label>
                    Jump to:
                    <input
                        type="number"
                        min={minSequence}
                        max={maxSequence}
                        placeholder={currentSequence}
                        defaultValue={currentSequence}
                    />
                </label>
                <button type="submit">Go</button>
            </form>

            <button
                className="nav-button next"
                onClick={goToNext}
                disabled={maxSequence && currentSequence >= maxSequence}
                title="Next ledger"
            >
                Next →
            </button>
        </div>
    )
}

