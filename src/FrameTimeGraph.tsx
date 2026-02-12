/**
 * @module react-dev-profiler
 * @description Rolling bar chart of frame times (last 60 samples).
 * @author Frederic Denis (billywild87) — https://github.com/billywild87
 * @license MIT
 */

import { s } from './styles'
import { HISTORY_SIZE } from './types'
import { GRAPH_BG, GRAPH_60FPS_LINE, GRAPH_30FPS_LINE, FPS_60_MS, FPS_30_MS, ftColor } from './constants'

export function FrameTimeGraph({ history }: { history: number[] }) {
    const max = Math.max(FPS_30_MS, ...history)
    const w = 140
    const h = 32
    const barW = Math.max(1, w / HISTORY_SIZE - 0.5)

    return (
        <div style={s.graphWrap}>
            <svg width={w} height={h} style={{ display: 'block' }}>
                <rect width={w} height={h} rx={3} fill={GRAPH_BG} />
                {/* 60 fps guideline */}
                <line x1={0} y1={h - (FPS_60_MS / max) * h} x2={w} y2={h - (FPS_60_MS / max) * h}
                    stroke={GRAPH_60FPS_LINE} strokeWidth={1} />
                {/* 30 fps guideline */}
                <line x1={0} y1={h - (FPS_30_MS / max) * h} x2={w} y2={h - (FPS_30_MS / max) * h}
                    stroke={GRAPH_30FPS_LINE} strokeWidth={1} />
                {history.map((ms, i) => {
                    const x = (i / HISTORY_SIZE) * w
                    const barH = Math.min((ms / max) * h, h)
                    return <rect key={i} x={x} y={h - barH} width={barW} height={barH} fill={ftColor(ms)} opacity={0.8} rx={0.5} />
                })}
            </svg>
        </div>
    )
}
