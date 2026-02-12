import { describe, it, expect } from 'vitest'
import {
    percentile,
    HISTORY_SIZE,
    INITIAL_PROFILER,
    INITIAL_STATS,
} from '../types'

describe('percentile()', () => {
    it('returns 0 for an empty array', () => {
        expect(percentile([], 99)).toBe(0)
    })

    it('returns the single element for a one-item array', () => {
        expect(percentile([42], 50)).toBe(42)
        expect(percentile([42], 99)).toBe(42)
    })

    it('returns the correct P50 (median) for a sorted array', () => {
        const sorted = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        expect(percentile(sorted, 50)).toBe(5)
    })

    it('returns the correct P99 for a sorted array', () => {
        const sorted = Array.from({ length: 100 }, (_, i) => i + 1)
        expect(percentile(sorted, 99)).toBe(99)
    })

    it('returns the last element for P100', () => {
        const sorted = [10, 20, 30]
        expect(percentile(sorted, 100)).toBe(30)
    })

    it('returns the first element for P1 on small arrays', () => {
        const sorted = [5, 10, 15]
        expect(percentile(sorted, 1)).toBe(5)
    })
})

describe('constants', () => {
    it('HISTORY_SIZE is 60', () => {
        expect(HISTORY_SIZE).toBe(60)
    })

    it('INITIAL_PROFILER has expected shape', () => {
        expect(INITIAL_PROFILER).toEqual({
            phase: 'mount',
            actualDuration: 0,
            baseDuration: 0,
            commitCount: 0,
        })
    })

    it('INITIAL_STATS has all required fields', () => {
        expect(INITIAL_STATS.domMutations).toBe(0)
        expect(INITIAL_STATS.domNodes).toBe(0)
        expect(INITIAL_STATS.frameTime).toBe(0)
        expect(INITIAL_STATS.frameTimeHistory).toEqual([])
        expect(INITIAL_STATS.longTasks).toBe(0)
        expect(INITIAL_STATS.rendersPerSecond).toBe(0)
        expect(INITIAL_STATS.memory).toBe(0)
        expect(INITIAL_STATS.dimensions).toBe('–')
        expect(INITIAL_STATS.profiler).toEqual(INITIAL_PROFILER)
    })
})
