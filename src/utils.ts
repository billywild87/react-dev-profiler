/**
 * @module react-dev-profiler
 * @description Pure utility functions for DOM measurement.
 * @author Frederic Denis (billywild87) — https://github.com/billywild87
 * @license MIT
 */

/**
 * Returns the effective bounding rect for an element.
 * For `display: contents` elements (which have no box), computes the
 * union rect of all direct children so anchoring still works.
 */
export function getEffectiveRect(el: HTMLElement): DOMRect {
    const rect = el.getBoundingClientRect()
    if (rect.width > 0 || rect.height > 0) return rect

    const children = el.children
    if (children.length === 0) return rect

    let top = Infinity, left = Infinity, bottom = -Infinity, right = -Infinity
    for (let i = 0; i < children.length; i++) {
        const cr = (children[i] as HTMLElement).getBoundingClientRect()
        if (cr.width === 0 && cr.height === 0) continue
        top = Math.min(top, cr.top)
        left = Math.min(left, cr.left)
        bottom = Math.max(bottom, cr.bottom)
        right = Math.max(right, cr.right)
    }
    if (top === Infinity) return rect
    return new DOMRect(left, top, right - left, bottom - top)
}

/**
 * Returns the direct children that have a real layout box.
 * Used to attach ResizeObserver when the wrapper itself is `display: contents`.
 */
export function getObservableChildren(el: HTMLElement): Element[] {
    const result: Element[] = []
    for (let i = 0; i < el.children.length; i++) {
        const child = el.children[i] as HTMLElement
        const r = child.getBoundingClientRect()
        if (r.width > 0 || r.height > 0) result.push(child)
    }
    return result
}
