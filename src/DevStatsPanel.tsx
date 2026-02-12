/**
 * @module react-dev-profiler
 * @description The main stats panel — renders all performance metrics in a floating overlay.
 * @author Frederic Denis (billywild87) — https://github.com/billywild87
 * @license MIT
 */

import { useState, useEffect, useCallback, useRef, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import styles from './DevProfiler.module.css'
import { useAnchorPosition, useDraggable, useDomTracker, useRenderRate, useLongTasks } from './hooks'
import { type ReactProfilerData, type PanelPosition, type DevStats, HISTORY_SIZE, INITIAL_STATS, percentile } from './types'

/** Rolling bar chart of frame times (last 60 samples). */
function FrameTimeGraph({ history }: { history: number[] }) {
    const max = Math.max(33, ...history)
    const w = 140
    const h = 32
    const barW = Math.max(1, w / HISTORY_SIZE - 0.5)

    return (
        <div className={styles.graphWrap}>
            <svg width={w} height={h} style={{ display: 'block' }}>
                <rect width={w} height={h} rx={3} fill="#111" />
                {/* 60 fps guideline */}
                <line x1={0} y1={h - (16.67 / max) * h} x2={w} y2={h - (16.67 / max) * h}
                    stroke="#1a3a1a" strokeWidth={1} />
                {/* 30 fps guideline */}
                <line x1={0} y1={h - (33 / max) * h} x2={w} y2={h - (33 / max) * h}
                    stroke="#3a1a1a" strokeWidth={1} />
                {history.map((ms, i) => {
                    const x = (i / HISTORY_SIZE) * w
                    const barH = Math.min((ms / max) * h, h)
                    const color = ms > 33 ? '#ef4444' : ms > 16.67 ? '#f59e0b' : '#4ade80'
                    return <rect key={i} x={x} y={h - barH} width={barW} height={barH} fill={color} opacity={0.8} rx={0.5} />
                })}
            </svg>
        </div>
    )
}

/** Single label → value row used throughout the panel. */
function StatRow({ label, value, sub, color = '#4ade80' }: { label: string, value: string, sub?: string, color?: string }) {
    return (
        <div className={styles.row}>
            <span className={styles.rowLabel}>{label}</span>
            <span>
                <span className={styles.rowValue} style={{ color }}>{value}</span>
                {sub && <span style={{ color: '#444', fontSize: 9, marginLeft: 4 }}>{sub}</span>}
            </span>
        </div>
    )
}

/** Computes fixed-position styles based on the chosen panel position + drag offset. */
function getPanelStyle(
    pos: { top: number; left: number },
    offset: { x: number; y: number },
    position: PanelPosition,
): CSSProperties {
    const style: CSSProperties = {
        transform: `translate(${offset.x}px, ${offset.y}px)`,
    }
    if (position.startsWith('bottom')) {
        style.bottom = window.innerHeight - pos.top
    } else {
        style.top = pos.top
    }
    if (position.endsWith('right')) {
        style.right = window.innerWidth - pos.left
    } else {
        style.left = pos.left
    }
    return style
}

/** Floating stats panel portaled to document.body. */
export function DevStatsPanel({
    targetRef,
    domTracker,
    renderRate,
    longTasks,
    profilerData,
    onClose,
    onReset,
    position = 'bottom-left',
    instanceId,
    instanceCount = 1,
}: {
    targetRef: React.RefObject<HTMLDivElement | null>
    domTracker: ReturnType<typeof useDomTracker>
    renderRate: ReturnType<typeof useRenderRate>
    longTasks: ReturnType<typeof useLongTasks>
    profilerData: React.RefObject<ReactProfilerData>
    onClose: () => void
    onReset: () => void
    position?: PanelPosition
    instanceId?: string
    instanceCount?: number
}) {
    const [stats, setStats] = useState<DevStats>(INITIAL_STATS)
    const [exported, setExported] = useState(false)
    const lastFrame = useRef(performance.now())
    const frameTimeHistory = useRef<number[]>([])
    const allFrameTimes = useRef<number[]>([])
    const pos = useAnchorPosition(targetRef, position)
    const { offset, handlers: dragHandlers } = useDraggable()

    // Collects frame timing data every rAF, then snapshots stats once per second.
    useEffect(() => {
        let animId: number
        let frameCount = 0
        let frameTotalMs = 0
        let lastSecond = performance.now()

        const tick = () => {
            const now = performance.now()
            const delta = now - lastFrame.current
            lastFrame.current = now
            frameCount++
            frameTotalMs += delta

            if (now - lastSecond >= 1000) {
                const avgFrameTime = frameTotalMs / frameCount

                const hist = frameTimeHistory.current
                if (hist.length >= HISTORY_SIZE) hist.shift()
                hist.push(avgFrameTime)

                allFrameTimes.current.push(avgFrameTime)
                const sorted = [...allFrameTimes.current].sort((a, b) => a - b)

                const el = targetRef.current
                const dims = el ? `${el.offsetWidth} x ${el.offsetHeight}` : '–'

                // Chrome-only: performance.memory exposes JS heap usage
                const perf = performance as any
                const mem = perf.memory ? Math.round(perf.memory.usedJSHeapSize / 1024 / 1024) : 0

                setStats({
                    domMutations: domTracker.mutations.current,
                    domNodes: domTracker.getNodeCount(),
                    frameTime: avgFrameTime,
                    frameTimeMin: sorted[0] ?? 0,
                    frameTimeMax: sorted[sorted.length - 1] ?? 0,
                    frameTimeP99: percentile(sorted, 99),
                    frameTimeHistory: [...hist],
                    longTasks: longTasks.count.current,
                    rendersPerSecond: renderRate.rendersPerSecond.current,
                    memory: mem,
                    dimensions: dims,
                    profiler: { ...profilerData.current },
                })

                frameCount = 0
                frameTotalMs = 0
                lastSecond = now
            }
            animId = requestAnimationFrame(tick)
        }
        animId = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(animId)
    }, [targetRef, domTracker, renderRate, longTasks])

    const handleReset = useCallback(() => {
        frameTimeHistory.current = []
        allFrameTimes.current = []
        setStats(INITIAL_STATS)
        onReset()
    }, [onReset])

    // Copy current stats as JSON to clipboard.
    const handleExport = useCallback(() => {
        const payload = { timestamp: new Date().toISOString(), ...stats }
        const json = JSON.stringify(payload, null, 2)
        try {
            navigator.clipboard.writeText(json).then(() => {
                setExported(true)
                setTimeout(() => setExported(false), 1200)
            })
        } catch {
            // Fallback for non-secure contexts
            const ta = document.createElement('textarea')
            ta.value = json
            ta.style.position = 'fixed'
            ta.style.opacity = '0'
            document.body.appendChild(ta)
            ta.select()
            document.execCommand('copy')
            document.body.removeChild(ta)
            setExported(true)
            setTimeout(() => setExported(false), 1200)
        }
    }, [stats])

    // Color thresholds: green = good, amber = warning, red = bad
    const ftColor = stats.frameTime > 33 ? '#ef4444' : stats.frameTime > 16.67 ? '#f59e0b' : '#4ade80'
    const rpsColor = stats.rendersPerSecond > 30 ? '#ef4444' : stats.rendersPerSecond > 10 ? '#f59e0b' : '#4ade80'
    const actualColor = stats.profiler.actualDuration > 16 ? '#ef4444' : stats.profiler.actualDuration > 8 ? '#f59e0b' : '#4ade80'
    const fps = stats.frameTime > 0 ? Math.round(1000 / stats.frameTime) : 0
    const memoGain = stats.profiler.baseDuration > 0
        ? Math.round((1 - stats.profiler.actualDuration / stats.profiler.baseDuration) * 100)
        : 0
    const p99Color = stats.frameTimeP99 > 33 ? '#ef4444' : stats.frameTimeP99 > 16.67 ? '#f59e0b' : '#4ade80'

    return createPortal(
        <div className={styles.panel} style={getPanelStyle(pos, offset, position)}>
            <div
                className={styles.panelHeader}
                {...dragHandlers}
            >
                <span className={styles.panelTitle}>
                    Dev Profiler
                    {instanceCount > 1 && instanceId && (
                        <span className={styles.instanceBadge}>{instanceId}</span>
                    )}
                </span>
                <div className={styles.headerActions}>
                    <button
                        className={`${styles.exportBtn} ${exported ? styles.exportBtnActive : ''}`}
                        onClick={handleExport}
                        title={exported ? 'Copied!' : 'Copy stats to clipboard'}
                    >
                        {exported ? (
                            <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/>
                            </svg>
                        ) : (
                            <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25z"/>
                                <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25z"/>
                            </svg>
                        )}
                    </button>
                    <button className={styles.resetBtn} onClick={handleReset} title="Reset counters">
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M14 1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1 0-2h1.6A6 6 0 0 0 2.07 7.5a1 1 0 1 1-1.97-.36A8 8 0 0 1 13 3.35V2a1 1 0 0 1 1-1zM2 15a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 0 2H4.4A6 6 0 0 0 13.93 8.5a1 1 0 1 1 1.97.36A8 8 0 0 1 3 12.65V14a1 1 0 0 1-1 1z"/>
                        </svg>
                    </button>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>
            </div>

            <div className={styles.body}>
                <span className={styles.section}>Rendering</span>
                <StatRow label="Frame time" value={`${stats.frameTime.toFixed(1)}ms`} sub={`${fps} fps`} color={ftColor} />
                <FrameTimeGraph history={stats.frameTimeHistory} />
                <div className={styles.miniRow}>
                    <span>min {stats.frameTimeMin.toFixed(1)}</span>
                    <span>max {stats.frameTimeMax.toFixed(1)}</span>
                    <span style={{ color: p99Color }}>p99 {stats.frameTimeP99.toFixed(1)}</span>
                </div>
                <StatRow label="Renders/s" value={String(stats.rendersPerSecond)} color={rpsColor} />
                <StatRow label="Long tasks" value={String(stats.longTasks)} color={stats.longTasks > 0 ? '#f59e0b' : '#4ade80'} />

                <div className={styles.separator} />
                <span className={styles.section}>React Profiler</span>
                <StatRow label="Phase" value={stats.profiler.phase} color="#888" />
                <StatRow label="Render" value={`${stats.profiler.actualDuration.toFixed(2)}ms`} color={actualColor} />
                <StatRow label="Base (no memo)" value={`${stats.profiler.baseDuration.toFixed(2)}ms`} color="#888" />
                <StatRow label="Memo gain" value={`${memoGain}%`} color={memoGain > 50 ? '#4ade80' : memoGain > 20 ? '#f59e0b' : '#ef4444'} />
                <StatRow label="Commits" value={String(stats.profiler.commitCount)} />

                <div className={styles.separator} />
                <span className={styles.section}>DOM</span>
                <StatRow label="Nodes" value={stats.domNodes.toLocaleString()} />
                <StatRow label="Mutations" value={String(stats.domMutations)} />
                <StatRow label="Size" value={stats.dimensions} color="#888" />

                <div className={styles.separator} />
                <span className={styles.section}>Memory</span>
                <StatRow label="JS Heap" value={stats.memory > 0 ? `${stats.memory} MB` : 'N/A'} />
            </div>

            <div className={styles.footer}>Ctrl+I to toggle</div>
        </div>,
        document.body
    )
}
