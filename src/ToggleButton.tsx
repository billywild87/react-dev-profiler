/**
 * @module react-dev-profiler
 * @description Minimal floating button that shows the current FPS at a glance.
 * @author Frederic Denis (billywild87) — https://github.com/billywild87
 * @license MIT
 */

import { useState, useEffect, useRef, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { s } from './styles'
import { useAnchorPosition } from './hooks'
import type { PanelPosition } from './types'

/** Computes fixed-position styles based on the chosen panel position. */
function getButtonStyle(pos: { top: number; left: number }, position: PanelPosition): CSSProperties {
    const style: CSSProperties = { ...s.toggleBtn }
    if (position.startsWith('bottom')) {
        style.bottom = window.innerHeight - pos.top + 8
    } else {
        style.top = pos.top + 8
    }
    if (position.endsWith('right')) {
        style.right = window.innerWidth - pos.left
    } else {
        style.left = pos.left
    }
    return style
}

/** Small floating pill showing live FPS — click to open the full panel. */
export function ToggleButton({
    targetRef,
    onClick,
    position = 'bottom-left',
}: {
    targetRef: React.RefObject<HTMLDivElement | null>
    onClick: () => void
    position?: PanelPosition
}) {
    const pos = useAnchorPosition(targetRef, position)
    const [fps, setFps] = useState(0)
    const lastFrame = useRef(performance.now())

    useEffect(() => {
        let animId: number
        let count = 0
        let lastSecond = performance.now()

        const tick = () => {
            const now = performance.now()
            lastFrame.current = now
            count++
            if (now - lastSecond >= 1000) {
                setFps(count)
                count = 0
                lastSecond = now
            }
            animId = requestAnimationFrame(tick)
        }
        animId = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(animId)
    }, [])

    const fpsColor = fps < 30 ? '#ef4444' : fps < 55 ? '#f59e0b' : '#4ade80'

    return createPortal(
        <button
            onClick={onClick}
            title="Dev Profiler (Ctrl+I)"
            style={getButtonStyle(pos, position)}
        >
            <span style={{ ...s.toggleFps, color: fpsColor }}>{fps}</span>
        </button>,
        document.body
    )
}
