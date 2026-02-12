/**
 * @module react-dev-profiler
 * @description Minimal floating button that shows the current FPS at a glance.
 * @author Frederic Denis (billywild87) — https://github.com/billywild87
 * @license MIT
 */

import { useState, useEffect, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { s } from './styles'
import { useAnchorPosition } from './hooks'
import type { PanelPosition } from './types'

/** Computes fixed-position styles based on the chosen panel position. */
const GAP = 8

function getButtonStyle(pos: { top: number; left: number }, position: PanelPosition): CSSProperties {
    const style: CSSProperties = { ...s.toggleBtn }
    if (position.startsWith('bottom')) {
        style.bottom = window.innerHeight - pos.top + GAP
    } else {
        style.top = pos.top + GAP
    }
    if (position.endsWith('right')) {
        style.right = window.innerWidth - pos.left + GAP
    } else {
        style.left = pos.left + GAP
    }
    return style
}

/** Small floating pill showing live FPS — click to open the full panel. */
export function ToggleButton({
    targetRef,
    onClick,
    position = 'bottom-left',
    accentColor = '#6366f1',
}: {
    targetRef: React.RefObject<HTMLDivElement | null>
    onClick: () => void
    position?: PanelPosition
    accentColor?: string
}) {
    const pos = useAnchorPosition(targetRef, position)
    const [fps, setFps] = useState(0)

    useEffect(() => {
        let animId: number
        let count = 0
        let lastSecond = performance.now()

        const tick = () => {
            const now = performance.now()
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

    return createPortal(
        <button
            onClick={onClick}
            title="Dev Profiler (Ctrl+I)"
            style={getButtonStyle(pos, position)}
        >
            <span style={{ ...s.toggleDot, background: accentColor, boxShadow: `0 0 4px ${accentColor}` }} />
            <span style={s.toggleFps as React.CSSProperties}>{fps}</span>
            <span style={s.toggleLabel as React.CSSProperties}>fps</span>
        </button>,
        document.body
    )
}
