import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ToggleButton } from '../ToggleButton'

// Mock useAnchorPosition to avoid ResizeObserver complexity
vi.mock('../hooks', () => ({
    useAnchorPosition: () => ({ top: 100, left: 200 }),
}))

function createTargetRef() {
    const el = document.createElement('div')
    document.body.appendChild(el)
    return { current: el }
}

describe('ToggleButton', () => {
    it('renders a button with the profiler title', () => {
        const ref = createTargetRef()
        render(<ToggleButton targetRef={ref} onClick={vi.fn()} />)
        expect(screen.getByTitle('Dev Profiler (Ctrl+I)')).toBeInTheDocument()
    })

    it('displays "fps" label', () => {
        const ref = createTargetRef()
        render(<ToggleButton targetRef={ref} onClick={vi.fn()} />)
        expect(screen.getByText('fps')).toBeInTheDocument()
    })

    it('calls onClick when clicked', () => {
        const ref = createTargetRef()
        const onClick = vi.fn()
        render(<ToggleButton targetRef={ref} onClick={onClick} />)

        fireEvent.click(screen.getByTitle('Dev Profiler (Ctrl+I)'))
        expect(onClick).toHaveBeenCalledOnce()
    })

    it('renders into document.body (portal)', () => {
        const ref = createTargetRef()
        render(<ToggleButton targetRef={ref} onClick={vi.fn()} />)
        const btn = screen.getByTitle('Dev Profiler (Ctrl+I)')
        expect(btn.parentElement).toBe(document.body)
    })

    it('applies custom accent color to the dot', () => {
        const ref = createTargetRef()
        render(<ToggleButton targetRef={ref} onClick={vi.fn()} accentColor="#ff0000" />)
        const btn = screen.getByTitle('Dev Profiler (Ctrl+I)')
        const dot = btn.querySelector('span')!
        expect(dot.style.background).toContain('rgb(255, 0, 0)')
    })
})
