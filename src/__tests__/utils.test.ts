import { describe, it, expect, vi } from 'vitest'
import { getEffectiveRect, getObservableChildren } from '../utils'

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
