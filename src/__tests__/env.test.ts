import { describe, it, expect } from 'vitest'
import { __DEV__ } from '../env'

describe('__DEV__', () => {
    it('is a boolean', () => {
        expect(typeof __DEV__).toBe('boolean')
    })

    it('is true in test environment (NODE_ENV=test)', () => {
        // Vitest sets NODE_ENV to 'test', which is not 'production',
        // so __DEV__ should be true.
        expect(__DEV__).toBe(true)
    })
})
