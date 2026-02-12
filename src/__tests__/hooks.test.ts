import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRenderRate, useLongTasks, useDraggable, getEffectiveRect, getObservableChildren, useDomTracker } from '../hooks'

/* ------------------------------------------------------------------ */
/*  getEffectiveRect                                                   */
/* ------------------------------------------------------------------ */
describe('getEffectiveRect', () => {
    it('returns the element rect when it has dimensions', () => {
        const el = document.createElement('div')
        vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(
            new DOMRect(10, 20, 100, 50)
        )
        const rect = getEffectiveRect(el)
        expect(rect.width).toBe(100)
        expect(rect.height).toBe(50)
        expect(rect.left).toBe(10)
        expect(rect.top).toBe(20)
    })

    it('computes union rect from children for display:contents elements', () => {
        const parent = document.createElement('div')
        vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 0, 0))

        const child1 = document.createElement('span')
        vi.spyOn(child1, 'getBoundingClientRect').mockReturnValue(new DOMRect(10, 10, 50, 30))
        const child2 = document.createElement('span')
        vi.spyOn(child2, 'getBoundingClientRect').mockReturnValue(new DOMRect(70, 20, 40, 60))

        parent.appendChild(child1)
        parent.appendChild(child2)

        const rect = getEffectiveRect(parent)
        expect(rect.left).toBe(10)
        expect(rect.top).toBe(10)
        expect(rect.width).toBe(100) // 110 - 10
        expect(rect.height).toBe(70) // 80 - 10
    })

    it('returns zero rect for display:contents with no children', () => {
        const el = document.createElement('div')
        vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 0, 0))

        const rect = getEffectiveRect(el)
        expect(rect.width).toBe(0)
        expect(rect.height).toBe(0)
    })

    it('skips zero-size children', () => {
        const parent = document.createElement('div')
        vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 0, 0))

        const hidden = document.createElement('span')
        vi.spyOn(hidden, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 0, 0))
        const visible = document.createElement('span')
        vi.spyOn(visible, 'getBoundingClientRect').mockReturnValue(new DOMRect(5, 5, 20, 20))

        parent.appendChild(hidden)
        parent.appendChild(visible)

        const rect = getEffectiveRect(parent)
        expect(rect.left).toBe(5)
        expect(rect.top).toBe(5)
        expect(rect.width).toBe(20)
        expect(rect.height).toBe(20)
    })
})

/* ------------------------------------------------------------------ */
/*  getObservableChildren                                              */
/* ------------------------------------------------------------------ */
describe('getObservableChildren', () => {
    it('returns only children with dimensions', () => {
        const parent = document.createElement('div')

        const visible = document.createElement('span')
        vi.spyOn(visible, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 50))
        const hidden = document.createElement('span')
        vi.spyOn(hidden, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 0, 0))

        parent.appendChild(visible)
        parent.appendChild(hidden)

        const result = getObservableChildren(parent)
        expect(result).toHaveLength(1)
        expect(result[0]).toBe(visible)
    })

    it('returns empty array when no children have dimensions', () => {
        const parent = document.createElement('div')
        const child = document.createElement('span')
        vi.spyOn(child, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 0, 0))
        parent.appendChild(child)

        expect(getObservableChildren(parent)).toHaveLength(0)
    })
})

/* ------------------------------------------------------------------ */
/*  useDomTracker                                                      */
/* ------------------------------------------------------------------ */
describe('useDomTracker', () => {
    it('starts with 0 mutations', () => {
        const ref = { current: document.createElement('div') }
        const { result } = renderHook(() => useDomTracker(ref, true))
        expect(result.current.mutations.current).toBe(0)
    })

    it('does not observe when disabled', () => {
        const observeSpy = vi.fn()
        const origMO = globalThis.MutationObserver
        globalThis.MutationObserver = class {
            observe = observeSpy
            disconnect = vi.fn()
            takeRecords = vi.fn()
            constructor(_cb: any) {}
        } as any

        const ref = { current: document.createElement('div') }
        renderHook(() => useDomTracker(ref, false))
        expect(observeSpy).not.toHaveBeenCalled()

        globalThis.MutationObserver = origMO
    })

    it('resets mutations and marks dirty', () => {
        const ref = { current: document.createElement('div') }
        const { result } = renderHook(() => useDomTracker(ref, true))

        result.current.mutations.current = 10
        act(() => { result.current.reset() })
        expect(result.current.mutations.current).toBe(0)
    })

    it('getNodeCount counts child elements', () => {
        const wrapper = document.createElement('div')
        wrapper.innerHTML = '<span><b>a</b></span><p>b</p>'
        const ref = { current: wrapper }
        const { result } = renderHook(() => useDomTracker(ref, true))

        const count = result.current.getNodeCount()
        // span, b, p = 3 elements
        expect(count).toBe(3)
    })
})

/* ------------------------------------------------------------------ */
/*  useRenderRate                                                      */
/* ------------------------------------------------------------------ */
describe('useRenderRate', () => {
    beforeEach(() => { vi.useFakeTimers() })
    afterEach(() => { vi.useRealTimers() })

    it('starts at 0 renders per second', () => {
        const { result } = renderHook(() => useRenderRate())
        expect(result.current.rendersPerSecond.current).toBe(0)
    })

    it('counts ticks and snapshots every second', () => {
        const { result } = renderHook(() => useRenderRate())

        act(() => {
            for (let i = 0; i < 5; i++) result.current.tick()
        })

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

    it('resets tick count after each snapshot', () => {
        const { result } = renderHook(() => useRenderRate())

        act(() => {
            for (let i = 0; i < 7; i++) result.current.tick()
        })
        act(() => { vi.advanceTimersByTime(1000) })
        expect(result.current.rendersPerSecond.current).toBe(7)

        // Next second with no ticks
        act(() => { vi.advanceTimersByTime(1000) })
        expect(result.current.rendersPerSecond.current).toBe(0)
    })
})

/* ------------------------------------------------------------------ */
/*  useLongTasks                                                       */
/* ------------------------------------------------------------------ */
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

    it('increments count when longtask entries arrive', () => {
        let observerCallback: (list: any) => void
        vi.stubGlobal('PerformanceObserver', class {
            disconnect = vi.fn()
            constructor(cb: any) { observerCallback = cb }
            observe = vi.fn()
        })

        const { result } = renderHook(() => useLongTasks(true))

        act(() => {
            observerCallback!({ getEntries: () => [{ name: 'self' }, { name: 'self' }] })
        })
        expect(result.current.count.current).toBe(2)

        vi.unstubAllGlobals()
    })
})

/* ------------------------------------------------------------------ */
/*  useDraggable                                                       */
/* ------------------------------------------------------------------ */
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
