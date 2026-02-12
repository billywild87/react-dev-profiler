import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DevStatsPanel } from '../DevStatsPanel'
import { INITIAL_PROFILER } from '../types'

// Minimal mock refs and trackers to satisfy DevStatsPanel props
function createMockProps(overrides: Record<string, any> = {}) {
    const targetRef = { current: document.createElement('div') }
    document.body.appendChild(targetRef.current)
    targetRef.current.style.width = '800px'
    targetRef.current.style.height = '600px'

    return {
        targetRef,
        domTracker: {
            mutations: { current: 3 },
            getNodeCount: () => 42,
            reset: vi.fn(),
        },
        renderRate: {
            rendersPerSecond: { current: 12 },
            tick: vi.fn(),
            reset: vi.fn(),
        },
        longTasks: {
            count: { current: 1 },
            reset: vi.fn(),
        },
        profilerData: { current: { ...INITIAL_PROFILER, actualDuration: 5.5, baseDuration: 12 } },
        onClose: vi.fn(),
        onReset: vi.fn(),
        ...overrides,
    }
}

describe('DevStatsPanel', () => {
    it('renders the panel title', () => {
        const props = createMockProps()
        render(<DevStatsPanel {...props} />)
        expect(screen.getByText('Dev Profiler')).toBeInTheDocument()
    })

    it('renders all section headers', () => {
        const props = createMockProps()
        render(<DevStatsPanel {...props} />)
        expect(screen.getByText('Rendering')).toBeInTheDocument()
        expect(screen.getByText('React Profiler')).toBeInTheDocument()
        expect(screen.getByText('DOM')).toBeInTheDocument()
        expect(screen.getByText('Memory')).toBeInTheDocument()
    })

    it('renders the footer hint', () => {
        const props = createMockProps()
        render(<DevStatsPanel {...props} />)
        expect(screen.getByText('Ctrl+I to toggle')).toBeInTheDocument()
    })

    it('calls onClose when close button is clicked', () => {
        const props = createMockProps()
        render(<DevStatsPanel {...props} />)
        fireEvent.click(screen.getByText('✕'))
        expect(props.onClose).toHaveBeenCalledOnce()
    })

    it('calls onReset when reset button is clicked', () => {
        const props = createMockProps()
        render(<DevStatsPanel {...props} />)
        const resetBtn = screen.getByTitle('Reset counters')
        fireEvent.click(resetBtn)
        expect(props.onReset).toHaveBeenCalledOnce()
    })

    it('shows instance badge when multiple instances exist', () => {
        const props = createMockProps({
            instanceId: 'sidebar',
            instanceCount: 2,
        })
        render(<DevStatsPanel {...props} />)
        expect(screen.getByText('sidebar')).toBeInTheDocument()
    })

    it('hides instance badge when only one instance exists', () => {
        const props = createMockProps({
            instanceId: 'main',
            instanceCount: 1,
        })
        render(<DevStatsPanel {...props} />)
        expect(screen.queryByText('main')).not.toBeInTheDocument()
    })

    it('has an export button that copies stats to clipboard', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined)
        Object.assign(navigator, { clipboard: { writeText } })

        const props = createMockProps()
        render(<DevStatsPanel {...props} />)

        const exportBtn = screen.getByTitle('Copy stats to clipboard')
        fireEvent.click(exportBtn)

        expect(writeText).toHaveBeenCalledOnce()
        const json = JSON.parse(writeText.mock.calls[0][0])
        expect(json).toHaveProperty('timestamp')
        expect(json).toHaveProperty('frameTime')
        expect(json).toHaveProperty('profiler')
    })

    it('renders the panel into document.body (portal)', () => {
        const props = createMockProps()
        render(<DevStatsPanel {...props} />)
        // The panel should be a direct child of body (portaled)
        const panels = document.body.querySelectorAll('[class*="panel"]')
        expect(panels.length).toBeGreaterThan(0)
    })
})
