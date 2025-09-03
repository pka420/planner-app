"use client"

import { useEffect, useMemo } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatasetSwitcher } from "./dataset-switcher"
import { DailyView } from "./daily-view"
import { MonthlyView } from "./monthly-view"
import { WeeklyView } from "./weekly-view"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { PlannerData } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type ViewMode = "daily" | "monthly" | "weekly"

export default function ClientApp() {
  const [dataset, setDataset] = useLocalStorage<string>("planner_dataset", "dse")
  const [view, setView] = useLocalStorage<ViewMode>("planner_view", "daily")

  const dataUrl = useMemo(() => `/data/${dataset}.json`, [dataset])
  const { data, error, isLoading, mutate } = useSWR<PlannerData>(dataUrl, fetcher, {
    revalidateOnFocus: false,
  })

  useEffect(() => {
    mutate()
  }, [dataset, mutate])

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <DatasetSwitcher value={dataset} onChange={setDataset} />
            <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <div className="text-sm text-muted-foreground">Loading data…</div>}
          {error && (
            <div className="text-sm text-red-600">
              Failed to load: {error instanceof Error ? error.message : "Unknown error"}
            </div>
          )}
          {!isLoading && !error && data && (
            <>
              {view === "daily" && <DailyView data={data} />}
              {view === "monthly" && <MonthlyView data={data} />}
              {view === "weekly" && <WeeklyView data={data} />}
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={() => mutate()}>
          Refresh data
        </Button>
      </div>
    </section>
  )
}
