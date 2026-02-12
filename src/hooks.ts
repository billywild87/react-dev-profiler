/**
 * @module react-dev-profiler
 * @description Custom hooks that power the profiler's data collection.
 * @author Frederic Denis (billywild87) — https://github.com/billywild87
 * @license MIT
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import styles from './DevProfiler.module.css'
import type { PanelPosition } from './types'

/**
 * Tracks a corner position of a referenced element using ResizeObserver.
 * Used to anchor the panel and toggle button near the profiled component.
 */
export function useAnchorPosition(
    ref: React.RefObject<HTMLDivElement | null>,
    position: PanelPosition = 'bottom-left'
) {
    const [pos, setPos] = useState({ top: 0, left: 0 })

    useEffect(() => {
        if (!ref.current) return
        const update = () => {
            if (!ref.current) return
            const rect = ref.current.getBoundingClientRect()
            const margin = 8
            switch (position) {
                case 'top-left':
                    setPos({ top: rect.top + margin, left: rect.left + margin }); break
                case 'top-right':
                    setPos({ top: rect.top + margin, left: rect.right - margin }); break
                case 'bottom-right':
                    setPos({ top: rect.bottom - margin, left: rect.right - margin }); break
                case 'bottom-left':
                default:
                    setPos({ top: rect.bottom - margin, left: rect.left + margin }); break
            }
        }
        const observer = new ResizeObserver(update)
        observer.observe(ref.current)
        observer.observe(document.documentElement)
        return () => observer.disconnect()
    }, [ref, position])

    return pos
}

/**
 * Makes an element draggable via Pointer Events.
 * Returns an offset to apply as CSS transform and event handlers for the drag handle.
 */
export function useDraggable() {
    const [offset, setOffset] = useState({ x: 0, y: 0 })
    const dragging = useRef(false)
    const start = useRef({ x: 0, y: 0 })

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        dragging.current = true
        start.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    }, [offset])

    const onPointerMove = useCallback((e: React.PointerEvent) => {
        if (!dragging.current) return
        setOffset({
            x: e.clientX - start.current.x,
            y: e.clientY - start.current.y,
        })
    }, [])

    const onPointerUp = useCallback(() => {
        dragging.current = false
    }, [])

    return { offset, handlers: { onPointerDown, onPointerMove, onPointerUp } }
}

/**
 * Counts real DOM mutations via MutationObserver (ignoring class-only changes).
 * The node count is cached and only recalculated when the DOM actually changes,
 * so we don't pay the cost of querySelectorAll('*') every frame.
 */
export function useDomTracker(wrapperRef: React.RefObject<HTMLDivElement | null>, enabled: boolean) {
    const mutations = useRef(0)
    const nodeCount = useRef(0)
    const dirty = useRef(true)

    useEffect(() => {
        if (!enabled || !wrapperRef.current) return
        const observer = new MutationObserver((records) => {
            let realMutation = false
            for (const record of records) {
                if (record.type === 'attributes' && record.attributeName === 'class') continue
                realMutation = true
            }
            if (realMutation) {
                mutations.current++
                dirty.current = true
            }
        })
        observer.observe(wrapperRef.current, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style'],
        })
        return () => observer.disconnect()
    }, [wrapperRef, enabled])

    const getNodeCount = useCallback(() => {
        if (dirty.current && wrapperRef.current) {
            nodeCount.current = wrapperRef.current.querySelectorAll('*').length
            dirty.current = false
        }
        return nodeCount.current
    }, [wrapperRef])

    const reset = useCallback(() => {
        mutations.current = 0
        dirty.current = true
    }, [])

    return { mutations, getNodeCount, reset }
}

/**
 * Measures how many React renders happen per second.
 * Call `tick()` from the <Profiler> onRender callback; the hook
 * snapshots the count every second and resets it.
 */
export function useRenderRate() {
    const renderCount = useRef(0)
    const rendersPerSecond = useRef(0)

    const tick = useCallback(() => {
        renderCount.current++
    }, [])

    useEffect(() => {
        const id = setInterval(() => {
            rendersPerSecond.current = renderCount.current
            renderCount.current = 0
        }, 1000)
        return () => clearInterval(id)
    }, [])

    const reset = useCallback(() => {
        renderCount.current = 0
        rendersPerSecond.current = 0
    }, [])

    return { rendersPerSecond, tick, reset }
}

/**
 * Flashes a subtle outline on the profiled element whenever the DOM mutates.
 * Skips the very first mutation (the initial mount) to avoid a flash on load.
 */
export function useRenderFlash(wrapperRef: React.RefObject<HTMLDivElement | null>, open: boolean) {
    const mutationCount = useRef(0)

    useEffect(() => {
        if (!open || !wrapperRef.current) return
        const observer = new MutationObserver(() => {
            mutationCount.current++
            if (!wrapperRef.current || mutationCount.current <= 1) return
            const el = wrapperRef.current
            el.classList.add(styles.flash)
            setTimeout(() => el.classList.remove(styles.flash), 150)
        })
        observer.observe(wrapperRef.current, { childList: true, subtree: true })
        return () => observer.disconnect()
    }, [wrapperRef, open])
}

/**
 * Detects browser "long tasks" (>50 ms) using PerformanceObserver.
 * Falls back silently in browsers that don't support the longtask entry type.
 */
export function useLongTasks(enabled: boolean) {
    const count = useRef(0)

    useEffect(() => {
        if (!enabled || typeof PerformanceObserver === 'undefined') return
        try {
            const observer = new PerformanceObserver((list) => {
                count.current += list.getEntries().length
            })
            observer.observe({ entryTypes: ['longtask'] })
            return () => observer.disconnect()
        } catch {
            // longtask not supported in this browser
        }
    }, [enabled])

    const reset = useCallback(() => { count.current = 0 }, [])

    return { count, reset }
}
