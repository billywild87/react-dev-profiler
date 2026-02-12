import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRenderRate, useLongTasks, useDraggable } from '../hooks'

describe('useRenderRate', () => {
    beforeEach(() => { vi.useFakeTimers() })
    afterEach(() => { vi.useRealTimers() })

    it('starts at 0 renders per second', () => {
        const { result } = renderHook(() => useRenderRate())
        expect(result.current.rendersPerSecond.current).toBe(0)
    })

    it('counts ticks and snapshots every second', () => {
        const { result } = renderHook(() => useRenderRate())

        // Simulate 5 renders
        act(() => {
            for (let i = 0; i < 5; i++) result.current.tick()
        })

        // Advance 1 second so the interval fires
        act(() => { vi.advanceTimersByTime(1000) })

        expect(result.current.rendersPerSecond.current).toBe(5)
    })

    it('resets counters', () => {
        const { result } = renderHook(() => useRenderRate())

        act(() => {
            for (let i = 0; i < 3; i++) result.current.tick()
        })
        act(() => { vi.advanceTimersByTime(1000) })
        expect(result.current.rendersPerSecond.current).toBe(3)

        act(() => { result.current.reset() })
        expect(result.current.rendersPerSecond.current).toBe(0)
    })
})

describe('useLongTasks', () => {
    it('starts with count at 0', () => {
        const { result } = renderHook(() => useLongTasks(true))
        expect(result.current.count.current).toBe(0)
    })

    it('does not observe when disabled', () => {
        const observeSpy = vi.fn()
        vi.stubGlobal('PerformanceObserver', class {
            observe = observeSpy
            disconnect = vi.fn()
            constructor(_cb: any) {}
        })

        renderHook(() => useLongTasks(false))
        expect(observeSpy).not.toHaveBeenCalled()

        vi.unstubAllGlobals()
    })

    it('resets count to 0', () => {
        const { result } = renderHook(() => useLongTasks(true))
        result.current.count.current = 5
        act(() => { result.current.reset() })
        expect(result.current.count.current).toBe(0)
    })
})

describe('useDraggable', () => {
    it('starts with zero offset', () => {
        const { result } = renderHook(() => useDraggable())
        expect(result.current.offset).toEqual({ x: 0, y: 0 })
    })

    it('exposes pointer event handlers', () => {
        const { result } = renderHook(() => useDraggable())
        expect(result.current.handlers).toHaveProperty('onPointerDown')
        expect(result.current.handlers).toHaveProperty('onPointerMove')
        expect(result.current.handlers).toHaveProperty('onPointerUp')
    })
})
