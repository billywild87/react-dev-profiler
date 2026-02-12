# Changelog

## [1.1.1] — 2026-02-12

### Changed
- Added default export for `DevProfiler` (dual export: default + named)

## [1.1.0] — 2026-02-12

### Fixed
- Removed unused `lastFrame` ref in `ToggleButton`
- Removed dead code in `useDomTracker` MutationObserver (redundant `class` filter and `attributes: true`)
- Fixed broken export test (was testing clipboard copy instead of JSON download)

### Tests
- Added tests for `getEffectiveRect` (4 tests)
- Added tests for `getObservableChildren` (2 tests)
- Added tests for `useDomTracker` (4 tests)
- Added test for `useLongTasks` callback integration
- Added test for `useRenderRate` snapshot reset between intervals
- Added `ToggleButton` component tests (5 tests)
- Added `DevProfiler` double toggle, Ctrl+I shortcut and `accentColor` prop tests (3 tests)

## [1.0.2] — 2025-05-01

### Fixed
- Moved from CSS modules to inline styles to avoid bundler compatibility issues

## [1.0.1] — 2025-04-30

### Changed
- Updated README badges

## [1.0.0] — 2025-04-30

### Added
- Initial release
- `<DevProfiler>` wrapper component with zero production overhead
- Real-time frame time graph (60-sample rolling history)
- FPS, renders/s, long tasks detection
- React Profiler integration (phase, render duration, memo gain %)
- DOM tracking (node count, mutations, element dimensions)
- Memory monitoring (Chrome JS heap)
- Floating toggle button with live FPS
- Draggable stats panel
- Configurable panel position (`top-left`, `top-right`, `bottom-left`, `bottom-right`)
- Global Ctrl+I / Cmd+I keyboard shortcut
- JSON export of stats
- Multi-instance support with instance badges
- Custom accent color
