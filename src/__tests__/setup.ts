import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement ResizeObserver — provide a minimal stub.
class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = ResizeObserverStub as any
}

// jsdom doesn't implement requestAnimationFrame — provide a minimal stub.
if (typeof globalThis.requestAnimationFrame === 'undefined') {
    globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 16) as any
    globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id)
}
