/**
 * @module react-dev-profiler
 * @description Inline styles for the profiler UI — no external CSS needed.
 * @author Frederic Denis (billywild87) — https://github.com/billywild87
 * @license MIT
 */

import type { CSSProperties } from 'react'

export const s = {
    wrapper: {
        display: 'contents',
    } satisfies CSSProperties,

    panel: {
        position: 'fixed',
        zIndex: 99999,
        background: 'rgba(8, 8, 8, 0.95)',
        border: '1px solid #222',
        borderRadius: 10,
        padding: '10px 14px',
        minWidth: 220,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7)',
        fontFamily: "'SF Mono', 'Fira Code', monospace",
        backdropFilter: 'blur(12px)',
        userSelect: 'none',
        color: '#ccc',
        fontSize: 11,
        cursor: 'grab',
        touchAction: 'none',
    } satisfies CSSProperties,

    panelHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    } satisfies CSSProperties,

    panelTitle: {
        color: '#666',
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
    } satisfies CSSProperties,

    instanceBadge: {
        background: '#222',
        color: '#888',
        fontSize: 8,
        padding: '1px 5px',
        borderRadius: 4,
        letterSpacing: 0.5,
        textTransform: 'none',
    } satisfies CSSProperties,

    headerActions: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    } satisfies CSSProperties,

    iconBtn: {
        background: 'none',
        border: 'none',
        color: '#444',
        cursor: 'pointer',
        padding: 4,
        margin: -4,
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        transition: 'color 0.15s',
    } satisfies CSSProperties,

    iconBtnActive: {
        color: '#4ade80',
    } satisfies CSSProperties,

    closeBtn: {
        background: 'none',
        border: 'none',
        color: '#444',
        cursor: 'pointer',
        fontSize: 13,
        padding: 4,
        margin: -4,
        lineHeight: 1,
    } satisfies CSSProperties,

    body: {
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
    } satisfies CSSProperties,

    section: {
        color: '#444',
        fontSize: 8,
        fontWeight: 600,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginTop: 2,
    } satisfies CSSProperties,

    separator: {
        height: 1,
        background: '#1a1a1a',
        margin: '2px 0',
    } satisfies CSSProperties,

    row: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1px 0',
    } satisfies CSSProperties,

    rowLabel: {
        color: '#555',
        fontSize: 10,
    } satisfies CSSProperties,

    rowValue: {
        fontSize: 11,
        fontWeight: 600,
    } satisfies CSSProperties,

    miniRow: {
        display: 'flex',
        justifyContent: 'space-between',
        color: '#444',
        fontSize: 9,
        marginTop: -2,
        marginBottom: 2,
    } satisfies CSSProperties,

    graphWrap: {
        marginTop: 4,
    } satisfies CSSProperties,

    toggleBtn: {
        position: 'fixed',
        zIndex: 99998,
        height: 26,
        borderRadius: 13,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(28, 28, 30, 0.92)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '0 10px 0 8px',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4), inset 0 0.5px 0 rgba(255, 255, 255, 0.06)',
    } satisfies CSSProperties,

    toggleDot: {
        width: 6,
        height: 6,
        borderRadius: '50%',
        flexShrink: 0,
    } satisfies CSSProperties,

    toggleFps: {
        fontFamily: "'SF Mono', 'Fira Code', monospace",
        fontSize: 11,
        fontWeight: 600,
        color: 'rgba(255, 255, 255, 0.85)',
        letterSpacing: -0.3,
        lineHeight: 1,
    } satisfies CSSProperties,

    toggleLabel: {
        fontFamily: "'SF Mono', 'Fira Code', monospace",
        fontSize: 9,
        fontWeight: 500,
        color: 'rgba(255, 255, 255, 0.35)',
        letterSpacing: 0,
        textTransform: 'lowercase',
    } satisfies CSSProperties,

    footer: {
        marginTop: 8,
        color: '#333',
        fontSize: 8,
        textAlign: 'center',
    } satisfies CSSProperties,
}

/** Flash outline class name applied directly via classList. */
export const FLASH_OUTLINE = '2px solid rgba(99, 102, 241, 0.8)'
