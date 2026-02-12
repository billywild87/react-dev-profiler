/**
 * @module react-dev-profiler
 * @description Shared colors and thresholds used across the profiler UI.
 * @author Frederic Denis (billywild87) — https://github.com/billywild87
 * @license MIT
 */

// ── Status colors ──────────────────────────────────────────────────
export const COLOR_GREEN = '#4ade80'
export const COLOR_AMBER = '#f59e0b'
export const COLOR_RED = '#ef4444'
export const COLOR_MUTED = '#888'
export const COLOR_DIM = '#444'
export const COLOR_ACCENT = '#6366f1'

// ── Frame-time thresholds (ms) ─────────────────────────────────────
export const FPS_60_MS = 16.67
export const FPS_30_MS = 33

// ── Graph colors ───────────────────────────────────────────────────
export const GRAPH_BG = '#111'
export const GRAPH_60FPS_LINE = '#1a3a1a'
export const GRAPH_30FPS_LINE = '#3a1a1a'

// ── Layout ─────────────────────────────────────────────────────────
export const PANEL_GAP = 8

// ── Helpers ────────────────────────────────────────────────────────

/** Returns green / amber / red based on frame-time thresholds. */
export function ftColor(ms: number): string {
    if (ms > FPS_30_MS) return COLOR_RED
    if (ms > FPS_60_MS) return COLOR_AMBER
    return COLOR_GREEN
}
