import React, {useState, useEffect} from 'react'
import './mobile-3d-controls.scss'

/**
 * Mobile-optimized 3D controls with touch gestures
 */
export function Mobile3DControls({onRotate, onZoom, onPan, className = ''}) {
    const [touchStart, setTouchStart] = useState(null)
    const [lastTouch, setLastTouch] = useState(null)

    const handleTouchStart = (e) => {
        if (e.touches.length === 1) {
            setTouchStart({
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            })
        } else if (e.touches.length === 2) {
            const touch1 = e.touches[0]
            const touch2 = e.touches[1]
            const distance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            )
            setTouchStart({distance, type: 'pinch'})
        }
    }

    const handleTouchMove = (e) => {
        if (!touchStart) return

        if (e.touches.length === 1 && touchStart.type !== 'pinch') {
            // Single touch - rotate/pan
            const deltaX = e.touches[0].clientX - touchStart.x
            const deltaY = e.touches[0].clientY - touchStart.y

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal movement - rotate
                onRotate?.({deltaX, deltaY: 0})
            } else {
                // Vertical movement - pan
                onPan?.({deltaX: 0, deltaY})
            }
        } else if (e.touches.length === 2 && touchStart.type === 'pinch') {
            // Pinch zoom
            const touch1 = e.touches[0]
            const touch2 = e.touches[1]
            const distance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            )
            const scale = distance / touchStart.distance
            onZoom?.(scale)
        }
    }

    const handleTouchEnd = () => {
        setTouchStart(null)
        setLastTouch(null)
    }

    return (
        <div
            className={`mobile-3d-controls ${className}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="control-buttons">
                <button
                    className="control-btn zoom-in"
                    onClick={() => onZoom?.(1.2)}
                    aria-label="Zoom in"
                >
                    +
                </button>
                <button
                    className="control-btn zoom-out"
                    onClick={() => onZoom?.(0.8)}
                    aria-label="Zoom out"
                >
                    −
                </button>
                <button
                    className="control-btn reset"
                    onClick={() => {
                        onRotate?.({deltaX: 0, deltaY: 0, reset: true})
                    }}
                    aria-label="Reset view"
                >
                    ⟲
                </button>
            </div>
        </div>
    )
}

