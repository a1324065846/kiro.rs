import { memo, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { TimeSeriesPoint, StatsRange } from '@/types/api'
import { tooltipContentStyle, tooltipCursorStyle, tooltipItemStyle, tooltipLabelStyle } from './tooltip-style'

interface Props {
  data: TimeSeriesPoint[]
  range: StatsRange
}

const COLORS = {
  input: '#3b82f6',
  output: '#10b981',
  cacheRead: '#a855f7',
  cacheCreation: '#f59e0b',
}

function formatTs(ts: string, range: StatsRange): string {
  const d = new Date(ts)
  if (range === '30d') {
    return `${d.getMonth() + 1}/${d.getDate()}`
  }
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:00`
}

/** 长列表稀疏化 X 轴 ticks，避免标签重叠引发的反复布局计算 */
function pickXAxisInterval(len: number): number | 'preserveStartEnd' {
  if (len <= 12) return 0
  if (len <= 48) return Math.ceil(len / 12)
  return Math.ceil(len / 16)
}

function TimeSeriesChartImpl({ data, range }: Props) {
  const formatted = useMemo(
    () => data.map((p) => ({ ...p, label: formatTs(p.ts, range) })),
    [data, range],
  )
  const interval = useMemo(() => pickXAxisInterval(formatted.length), [formatted.length])

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formatted} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11 }}
          className="fill-muted-foreground"
          interval={interval}
        />
        <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
        <Tooltip
          contentStyle={tooltipContentStyle}
          labelStyle={tooltipLabelStyle}
          itemStyle={tooltipItemStyle}
          cursor={tooltipCursorStyle}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="inputTokens"
          stroke={COLORS.input}
          name="输入"
          dot={false}
          strokeWidth={2}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="outputTokens"
          stroke={COLORS.output}
          name="输出"
          dot={false}
          strokeWidth={2}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="cacheReadTokens"
          stroke={COLORS.cacheRead}
          name="缓存读取"
          dot={false}
          strokeWidth={1.5}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="cacheCreationTokens"
          stroke={COLORS.cacheCreation}
          name="缓存创建"
          dot={false}
          strokeWidth={1.5}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export const TimeSeriesChart = memo(TimeSeriesChartImpl)
