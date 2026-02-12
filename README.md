# react-dev-profiler

Real-time React performance monitoring for development. Zero overhead in production.

[![npm version](https://img.shields.io/npm/v/react-dev-profiler)](https://www.npmjs.com/package/react-dev-profiler)
[![license](https://img.shields.io/npm/l/react-dev-profiler?v=2)](./LICENSE)

## What it does

Wrap any part of your React app with `<DevProfiler>` and get a floating panel that shows:

- **Frame time & FPS** — rolling graph with min/max/P99 stats
- **Renders per second** — how often React commits
- **React Profiler** — actual vs. base render duration, memoization gains
- **DOM** — node count, mutation count, element dimensions
- **Memory** — JS heap usage (Chrome only)
- **Long tasks** — browser tasks exceeding 50 ms
- **Visual flash** — brief outline pulse on DOM mutations
- **Data export** — copy all stats as JSON to your clipboard
- **Draggable panel** — grab the header and move it anywhere

Toggle it with **Ctrl+I** (or **Cmd+I** on Mac). In production, the component renders nothing — zero runtime cost.

## Install

```bash
npm install react-dev-profiler
```

## Usage

```tsx
import { DevProfiler } from 'react-dev-profiler'

function App() {
  return (
    <DevProfiler>
      <YourApp />
    </DevProfiler>
  )
}
```

That's it. Open your app in dev mode and press **Ctrl+I**.

### Position the panel

```tsx
<DevProfiler position="top-right">
  <YourApp />
</DevProfiler>
```

### Multiple instances

```tsx
<DevProfiler id="sidebar" position="top-left">
  <Sidebar />
</DevProfiler>

<DevProfiler id="main" position="bottom-right">
  <MainContent />
</DevProfiler>
```

When more than one instance is active, each panel shows its ID as a badge.

## Requirements

- React 18+
- Any bundler (Vite, webpack, Next.js, Astro, etc.)

## How it works

`<DevProfiler>` wraps your children with React's built-in `<Profiler>` component and layers on a few browser APIs:

| API                     | What it measures              |
| ----------------------- | ----------------------------- |
| `requestAnimationFrame` | Frame timing & FPS            |
| `MutationObserver`      | DOM mutations & node count    |
| `PerformanceObserver`   | Long tasks (>50 ms)           |
| `performance.memory`    | JS heap size (Chrome only)    |
| `ResizeObserver`        | Element dimensions & position |

All observers are created lazily (only when the panel is open) and cleaned up on close.

## API

### `<DevProfiler>`

| Prop       | Type            | Default         | Description                              |
| ---------- | --------------- | --------------- | ---------------------------------------- |
| `children` | `ReactNode`     | —               | The subtree to profile                   |
| `position` | `PanelPosition` | `'bottom-left'` | Where to anchor the panel                |
| `id`       | `string`        | auto-generated  | Instance label (shown with multi-panels) |

### `PanelPosition`

```ts
type PanelPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
```

### Exported types

```ts
import type { DevStats, ReactProfilerData, PanelPosition } from 'react-dev-profiler'
```

## License

MIT — Frederic Denis ([billywild87](https://github.com/billywild87))
