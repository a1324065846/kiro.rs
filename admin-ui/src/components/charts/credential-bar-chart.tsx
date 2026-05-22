import { memo, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { CredentialDistribution } from '@/types/api'
import { tooltipContentStyle, tooltipCursorStyle, tooltipItemStyle, tooltipLabelStyle } from './tooltip-style'

interface Props {
  data: CredentialDistribution[]
}

function CredentialBarChartImpl({ data }: Props) {
  const formatted = useMemo(
    () =>
      data.slice(0, 12).map((d) => ({
        label: d.email ? `#${d.credentialId} ${shortenEmail(d.email)}` : `#${d.credentialId}`,
        inputTokens: d.inputTokens,
        outputTokens: d.outputTokens,
        calls: d.calls,
        errors: d.errors,
      })),
    [data],
  )

  if (data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        暂无数据
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={formatted} margin={{ top: 8, right: 16, left: 0, bottom: 48 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10 }}
          angle={-25}
          textAnchor="end"
          interval={0}
          height={56}
        />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={tooltipContentStyle}
          labelStyle={tooltipLabelStyle}
          itemStyle={tooltipItemStyle}
          cursor={tooltipCursorStyle}
        />
        <Legend
          verticalAlign="top"
          align="right"
          height={28}
          wrapperStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="inputTokens" name="输入" stackId="a" fill="#3b82f6" isAnimationActive={false} />
        <Bar dataKey="outputTokens" name="输出" stackId="a" fill="#10b981" isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export const CredentialBarChart = memo(CredentialBarChartImpl)

function shortenEmail(email: string): string {
  const at = email.indexOf('@')
  if (at < 0) return email.length > 14 ? email.slice(0, 12) + '...' : email
  const name = email.slice(0, at)
  return name.length > 10 ? name.slice(0, 8) + '..' : name
}
