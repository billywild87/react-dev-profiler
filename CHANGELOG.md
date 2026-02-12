# Changelog

## [1.2.0] — 2026-02-12

### Added
- `src/constants.ts` — centralized colors (`COLOR_GREEN`, `COLOR_AMBER`, `COLOR_RED`, `COLOR_MUTED`, `COLOR_DIM`, `COLOR_ACCENT`), frame-time thresholds (`FPS_60_MS`, `FPS_30_MS`), graph colors, `PANEL_GAP`, and `ftColor()` helper
- `src/utils.ts` — extracted `getEffectiveRect` and `getObservableChildren` from `hooks.ts`
- `src/FrameTimeGraph.tsx` — extracted from `DevStatsPanel`
- `src/StatRow.tsx` — extracted from `DevStatsPanel`
- `src/__tests__/utils.test.ts` — dedicated tests for utility functions (6 tests)
- `accentColor` prop documented in README API table
- GitHub Actions CI workflow (test + build on Node 20, 22)

### Changed
- All hardcoded colors and thresholds replaced by constants across components and styles
- `hooks.ts` re-exports utils for backward compatibility
- `DevProfiler.tsx` uses `COLOR_ACCENT` instead of hardcoded `'#6366f1'`

### Fixed
- Removed phantom `./styles.css` export from `package.json` (file did not exist)
- Removed ambiguous default export from `index.ts` (named export only)
- Fixed `act()` warnings in `DevProfiler.test.tsx`

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
