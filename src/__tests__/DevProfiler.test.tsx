import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DevProfiler } from '../DevProfiler'

// Mock the child components to avoid portal/rAF complexity
vi.mock('../DevStatsPanel', () => ({
    DevStatsPanel: () => <div data-testid="stats-panel" />,
}))
vi.mock('../ToggleButton', () => ({
    ToggleButton: () => <button data-testid="toggle-button" />,
}))

describe('DevProfiler', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders children', () => {
        render(
            <DevProfiler>
                <div data-testid="child">Hello</div>
            </DevProfiler>
        )
        expect(screen.getByTestId('child')).toBeInTheDocument()
        expect(screen.getByTestId('child')).toHaveTextContent('Hello')
    })

    it('renders the toggle button when closed (default)', () => {
        render(
            <DevProfiler>
                <div>Content</div>
            </DevProfiler>
        )
        expect(screen.getByTestId('toggle-button')).toBeInTheDocument()
    })

    it('does not render the stats panel when closed', () => {
        render(
            <DevProfiler>
                <div>Content</div>
            </DevProfiler>
        )
        expect(screen.queryByTestId('stats-panel')).not.toBeInTheDocument()
    })

    it('accepts a position prop without crashing', () => {
        const { container } = render(
            <DevProfiler position="top-right">
                <div>Content</div>
            </DevProfiler>
        )
        expect(container).toBeTruthy()
    })

    it('accepts an id prop without crashing', () => {
        const { container } = render(
            <DevProfiler id="test-profiler">
                <div>Content</div>
            </DevProfiler>
        )
        expect(container).toBeTruthy()
    })

    it('wraps children in a div with wrapper class', () => {
        const { container } = render(
            <DevProfiler>
                <span>Test</span>
            </DevProfiler>
        )
        const wrapper = container.firstChild as HTMLElement
        expect(wrapper.tagName).toBe('DIV')
        expect(wrapper.style.display).toBe('contents')
    })

    it('opens the panel on toggle event', async () => {
        render(
            <DevProfiler>
                <div>Content</div>
            </DevProfiler>
        )

        // Dispatch the toggle event
        window.dispatchEvent(new CustomEvent('devprofiler:toggle'))

        // Wait for state update
        await vi.waitFor(() => {
            expect(screen.getByTestId('stats-panel')).toBeInTheDocument()
        })
    })

    it('hides the toggle button when panel is open', async () => {
        render(
            <DevProfiler>
                <div>Content</div>
            </DevProfiler>
        )

        window.dispatchEvent(new CustomEvent('devprofiler:toggle'))

        await vi.waitFor(() => {
            expect(screen.queryByTestId('toggle-button')).not.toBeInTheDocument()
        })
    })

    it('double toggle returns to initial state (closed)', async () => {
        render(
            <DevProfiler>
                <div>Content</div>
            </DevProfiler>
        )

        // Open
        window.dispatchEvent(new CustomEvent('devprofiler:toggle'))
        await vi.waitFor(() => {
            expect(screen.getByTestId('stats-panel')).toBeInTheDocument()
        })

        // Close
        window.dispatchEvent(new CustomEvent('devprofiler:toggle'))
        await vi.waitFor(() => {
            expect(screen.queryByTestId('stats-panel')).not.toBeInTheDocument()
            expect(screen.getByTestId('toggle-button')).toBeInTheDocument()
        })
    })

    it('toggles on Ctrl+I keyboard shortcut', async () => {
        render(
            <DevProfiler>
                <div>Content</div>
            </DevProfiler>
        )

        fireEvent.keyDown(window, { key: 'i', ctrlKey: true })

        await vi.waitFor(() => {
            expect(screen.getByTestId('stats-panel')).toBeInTheDocument()
        })
    })

    it('accepts accentColor prop without crashing', () => {
        const { container } = render(
            <DevProfiler accentColor="#ff0000">
                <div>Content</div>
            </DevProfiler>
        )
        expect(container).toBeTruthy()
    })
})
