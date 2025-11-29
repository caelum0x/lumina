import React, {useState, useCallback} from 'react'
import {useStore} from './store'

/**
 * Time Travel Controls Component (UI only, no R3F hooks)
 */
export function TimeTravelControls({title}) {
    const [isActive, setIsActive] = useState(false)
    const [playbackSpeed, setPlaybackSpeed] = useState(1)

    const startTimeTravel = useCallback(() => {
        setIsActive(true)
        // TODO: Implement time travel replay logic
        console.log('Time travel started at speed:', playbackSpeed)
    }, [playbackSpeed])

    const stopTimeTravel = useCallback(() => {
        setIsActive(false)
        console.log('Time travel stopped')
    }, [])

    return (
        <div className="time-travel-controls" title={title || "Time Travel Mode - Replay historical transactions"}>
            <button
                className={`time-travel-button ${isActive ? 'active' : ''}`}
                onClick={isActive ? stopTimeTravel : startTimeTravel}
                title={isActive ? "Stop time travel replay" : "Start replaying historical transactions"}
            >
                {isActive ? '⏸️ Stop' : '⏪ Time Travel'}
            </button>
            {isActive && (
                <div className="playback-speed-controls">
                    <label title="Adjust playback speed for time travel">
                        Speed:
                        <select
                            value={playbackSpeed}
                            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                            title="Select playback speed multiplier"
                        >
                            <option value={1}>1x</option>
                            <option value={10}>10x</option>
                            <option value={100}>100x</option>
                            <option value={1000}>1000x</option>
                        </select>
                    </label>
                </div>
            )}
        </div>
    )
}

