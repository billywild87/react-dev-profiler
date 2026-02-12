/**
 * @module react-dev-profiler
 * @description Type definitions and constants for the profiler.
 * @author Frederic Denis (billywild87) — https://github.com/billywild87
 * @license MIT
 */

/** Data captured from React's built-in <Profiler> callback. */
export type ReactProfilerData = {
    phase: string
    actualDuration: number
    baseDuration: number
    commitCount: number
}

/** Aggregated stats displayed in the profiler panel. */
export type DevStats = {
    domMutations: number
    domNodes: number
    frameTime: number
    frameTimeMin: number
    frameTimeMax: number
    frameTimeP99: number
    frameTimeHistory: number[]
    longTasks: number
    rendersPerSecond: number
    memory: number
    dimensions: string
    profiler: ReactProfilerData
}

/** Where the panel anchors relative to the profiled element. */
export type PanelPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'

/** How many frames we keep in the rolling history graph. */
export const HISTORY_SIZE = 60

export const INITIAL_PROFILER: ReactProfilerData = {
    phase: 'mount',
    actualDuration: 0,
    baseDuration: 0,
    commitCount: 0,
}

export const INITIAL_STATS: DevStats = {
    domMutations: 0,
    domNodes: 0,
    frameTime: 0,
    frameTimeMin: 0,
    frameTimeMax: 0,
    frameTimeP99: 0,
    frameTimeHistory: [],
    longTasks: 0,
    rendersPerSecond: 0,
    memory: 0,
    dimensions: '–',
    profiler: INITIAL_PROFILER,
}

/** Returns the value at a given percentile from a pre-sorted array. */
export function percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0
    const idx = Math.ceil((p / 100) * sorted.length) - 1
    return sorted[Math.max(0, idx)]
}
