/**
 * @module react-dev-profiler
 * @description Environment detection — works with Vite, webpack, Next.js, and any bundler.
 * @author Frederic Denis (billywild87) — https://github.com/billywild87
 * @license MIT
 */

/**
 * True when running in a development environment.
 * Relies on `process.env.NODE_ENV` which all major bundlers replace at build time,
 * enabling dead-code elimination in production.
 */
export const __DEV__: boolean =
    typeof process !== 'undefined'
        ? process.env.NODE_ENV !== 'production'
        : true
