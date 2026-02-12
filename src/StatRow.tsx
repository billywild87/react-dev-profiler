/**
 * @module react-dev-profiler
 * @description Single label/value row used throughout the profiler panel.
 * @author Frederic Denis (billywild87) — https://github.com/billywild87
 * @license MIT
 */

import { s } from './styles'
import { COLOR_GREEN, COLOR_DIM } from './constants'

export function StatRow({ label, value, sub, color = COLOR_GREEN }: { label: string, value: string, sub?: string, color?: string }) {
    return (
        <div style={s.row}>
            <span style={s.rowLabel}>{label}</span>
            <span>
                <span style={{ ...s.rowValue, color }}>{value}</span>
                {sub && <span style={{ color: COLOR_DIM, fontSize: 9, marginLeft: 4 }}>{sub}</span>}
            </span>
        </div>
    )
}
