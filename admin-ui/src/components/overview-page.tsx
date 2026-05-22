import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Activity, Cpu, KeyRound, Server } from 'lucide-react'
import { useByCredential, useByModel, useOverview, useTimeSeries } from '@/hooks/use-stats'
import type { StatsRange } from '@/types/api'
import { TimeSeriesChart } from '@/components/charts/time-series-chart'
import { ModelPieChart } from '@/components/charts/model-pie-chart'
import { CredentialBarChart } from '@/components/charts/credential-bar-chart'

const RANGES: { label: string; value: StatsRange }[] = [
  { label: '24 小时', value: '24h' },
  { label: '7 天', value: '7d' },
  { label: '30 天', value: '30d' },
]

function rangeLabel(range: StatsRange): string {
  return `近 ${RANGES.find((r) => r.value === range)?.label ?? range}`
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

export function OverviewPage() {
  const [range, setRange] = useState<StatsRange>('24h')
  const { data: overview } = useOverview()
  const { data: series } = useTimeSeries(range)
  const { data: byModel } = useByModel(range)
  const { data: byCred } = useByCredential(range)

  // 给 chart 用的稳定数组：query 在没有数据时返回 undefined → memo 成同一空数组
  const seriesData = useMemo(() => series ?? [], [series])
  const modelData = useMemo(() => byModel ?? [], [byModel])
  const credData = useMemo(() => byCred ?? [], [byCred])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[28px] font-semibold tracking-tight leading-tight">概览</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          中转站调用情况、Token 消耗趋势与上游凭据贡献
        </p>
      </div>

      {/* 顶部卡片 */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <StatCard
          icon={<Activity className="h-4 w-4" />}
          label="今日调用"
          value={overview?.todayCalls ?? 0}
          extra={
            overview && overview.todayErrors > 0 ? (
              <Badge variant="destructive">异常 {overview.todayErrors}</Badge>
            ) : null
          }
        />
        <StatCard
          icon={<Cpu className="h-4 w-4" />}
          label="今日输入 Token"
          value={formatTokens(overview?.todayInputTokens ?? 0)}
        />
        <StatCard
          icon={<Cpu className="h-4 w-4" />}
          label="今日输出 Token"
          value={formatTokens(overview?.todayOutputTokens ?? 0)}
        />
        <StatCard
          icon={<KeyRound className="h-4 w-4" />}
          label="启用的客户端 Key"
          value={`${overview?.activeClientKeys ?? 0}`}
          extra={
            <span className="text-[11px] text-muted-foreground">
              上游 {overview?.activeCredentials ?? 0}
            </span>
          }
        />
      </div>

      {/* 时序图 */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Token 消耗趋势</h2>
              <p className="text-[12px] text-muted-foreground">
                按 {range === '30d' ? '天' : '小时'} 聚合 · 输入/输出/缓存读写
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-border/60 p-0.5">
              {RANGES.map((r) => (
                <Button
                  key={r.value}
                  size="sm"
                  variant={range === r.value ? 'default' : 'ghost'}
                  className="h-7 rounded-full px-3 text-xs"
                  onClick={() => setRange(r.value)}
                >
                  {r.label}
                </Button>
              ))}
            </div>
          </div>
          <TimeSeriesChart data={seriesData} range={range} />
        </CardContent>
      </Card>

      {/* 模型 + 凭据 两栏 */}
      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold tracking-tight">按模型分布</h2>
              <span className="text-[11px] text-muted-foreground">{rangeLabel(range)}</span>
            </div>
            <ModelPieChart data={modelData} />
            {byModel && byModel.length > 0 && (
              <div className="mt-3 max-h-32 overflow-auto text-[12px]">
                <table className="w-full">
                  <thead className="text-muted-foreground">
                    <tr>
                      <th className="text-left font-medium pb-1">模型</th>
                      <th className="text-right font-medium">调用</th>
                      <th className="text-right font-medium">输入</th>
                      <th className="text-right font-medium">输出</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byModel.map((m) => (
                      <tr key={m.model} className="border-t border-border/40">
                        <td className="py-1 truncate">{m.model}</td>
                        <td className="text-right tabular-nums">{m.calls}</td>
                        <td className="text-right tabular-nums">{formatTokens(m.inputTokens)}</td>
                        <td className="text-right tabular-nums">{formatTokens(m.outputTokens)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold tracking-tight">按上游凭据分布</h2>
              <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                <Server className="h-3 w-3" />Top {Math.min(byCred?.length ?? 0, 12)}
              </span>
            </div>
            <CredentialBarChart data={credData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  extra,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  extra?: React.ReactNode
}) {
  return (
    <Card className="hover:shadow-apple-lg hover:-translate-y-0.5">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
          {icon}
          {label}
        </div>
        <div className="mt-2 flex items-end justify-between">
          <span className="text-3xl font-semibold tracking-tight tabular-nums">{value}</span>
          {extra}
        </div>
      </CardContent>
    </Card>
  )
}
