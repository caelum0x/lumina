import React, {useEffect} from 'react'
import {useParams, useHistory} from 'react-router'
import ThreeGalaxyView from './three-galaxy-view'
import ThreeGalaxyOverlay from './three-galaxy-overlay'

export default function ThreeGraphRouter() {
    const {network} = useParams()
    const history = useHistory()

    useEffect(() => {
        // Redirect to public network if no network specified
        if (!network) {
            history.replace('/graph/3d/public')
        }
    }, [network, history])

    if (!network) {
        return null
    }

    return (
        <div className="three-graph-container">
            <ThreeGalaxyView />
            <ThreeGalaxyOverlay />
        </div>
    )
}

