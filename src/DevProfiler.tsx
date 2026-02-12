/**
 * @module react-dev-profiler
 * @description Main wrapper component — wraps your app and enables profiling.
 * @author Frederic Denis (billywild87) — https://github.com/billywild87
 * @license MIT
 */

import { Profiler, useRef, useState, useEffect, useCallback, type ReactNode } from 'react'
import { type ReactProfilerData, type PanelPosition, INITIAL_PROFILER } from './types'
import { COLOR_ACCENT } from './constants'
import { __DEV__ } from './env'
import { useDomTracker, useRenderRate, useRenderFlash, useLongTasks } from './hooks'
import { DevStatsPanel } from './DevStatsPanel'
import { ToggleButton } from './ToggleButton'

/*
 * Global keyboard shortcut: Ctrl+I (or Cmd+I) to toggle the profiler.
 * Registered once and kept alive across HMR reloads via a window flag.
 */
const TOGGLE_EVENT = 'devprofiler:toggle'
const BOUND_KEY = '__devprofiler_bound'

if (typeof window !== 'undefined' && __DEV__ && !(window as any)[BOUND_KEY]) {
    (window as any)[BOUND_KEY] = true
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault()
            window.dispatchEvent(new CustomEvent(TOGGLE_EVENT))
        }
    })
}

/* Module-level registry to track active profiler instances. */
let instanceCounter = 0
const activeInstances = new Set<string>()

/**
 * Wrap your application (or any subtree) with `<DevProfiler>` to enable
 * real-time performance monitoring during development.
 *
 * In production builds the profiler is completely stripped — children
 * are rendered as-is with zero overhead.
 *
 * @example
 * ```tsx
 * import { DevProfiler } from 'react-dev-profiler'
 *
 * function App() {
 *   return (
 *     <DevProfiler>
 *       <YourApp />
 *     </DevProfiler>
 *   )
 * }
 * ```
 */
export function DevProfiler({
    children,
    position = 'bottom-left',
    id,
    accentColor = COLOR_ACCENT,
}: {
    children: ReactNode
    /** Where to anchor the panel. @default 'bottom-left' */
    position?: PanelPosition
    /** Optional identifier — shown in the panel when multiple instances are active. */
    id?: string
    /** Accent color for the toggle button border/glow. @default COLOR_ACCENT */
    accentColor?: string
}) {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const [open, setOpen] = useState(false)
    const toggle = useCallback(() => setOpen(prev => !prev), [])

    // Generate a stable instance ID (user-provided or auto-incremented).
    const instanceId = useRef(id ?? `profiler-${++instanceCounter}`).current

    useEffect(() => {
        activeInstances.add(instanceId)
        return () => { activeInstances.delete(instanceId) }
    }, [instanceId])

    const domTracker = useDomTracker(wrapperRef, open)
    const renderRate = useRenderRate()
    const longTasks = useLongTasks(open)
    useRenderFlash(wrapperRef, open)

    const profilerData = useRef<ReactProfilerData>({ ...INITIAL_PROFILER })
    const onRender = useCallback((_id: string, phase: string, actualDuration: number, baseDuration: number) => {
        profilerData.current = {
            phase,
            actualDuration,
            baseDuration,
            commitCount: profilerData.current.commitCount + 1,
        }
        renderRate.tick()
    }, [renderRate])

    const handleReset = useCallback(() => {
        domTracker.reset()
        renderRate.reset()
        longTasks.reset()
        profilerData.current = { ...INITIAL_PROFILER }
    }, [domTracker, renderRate, longTasks])

    useEffect(() => {
        const handler = () => setOpen(prev => !prev)
        window.addEventListener(TOGGLE_EVENT, handler)
        return () => window.removeEventListener(TOGGLE_EVENT, handler)
    }, [])

    if (!__DEV__) return <>{children}</>

    return (
        <div ref={wrapperRef} style={{ display: 'contents' }}>
            <Profiler id="DevProfiler" onRender={onRender}>
                {children}
            </Profiler>
            {!open && <ToggleButton targetRef={wrapperRef} onClick={toggle} position={position} accentColor={accentColor} />}
            {open && (
                <DevStatsPanel
                    targetRef={wrapperRef}
                    domTracker={domTracker}
                    renderRate={renderRate}
                    longTasks={longTasks}
                    profilerData={profilerData}
                    onClose={toggle}
                    onReset={handleReset}
                    position={position}
                    instanceId={instanceId}
                    instanceCount={activeInstances.size}
                />
            )}
        </div>
    )
}
