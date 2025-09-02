"use client"

import type { PlannerData } from "@/lib/types"
import { addDays, endOfMonth, endOfWeek, format, isSameMonth, isToday, startOfMonth, startOfWeek } from "date-fns"
import { Card } from "@/components/ui/card"

type Props = { data: PlannerData }

export function MonthlyView({ data }: Props) {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days: Date[] = []
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) days.push(d)

  // Index events by date string
  const eventMap = new Map<string, { title: string; time?: string }[]>()
  for (const e of data.events ?? []) {
    const key = e.date
    if (!eventMap.has(key)) eventMap.set(key, [])
    eventMap.get(key)!.push({ title: e.title, time: e.time })
  }

  return (
    <div className="grid grid-cols-7 gap-2">
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
        <div key={d} className="px-2 pb-1 text-center text-xs font-medium text-muted-foreground">
          {d}
        </div>
      ))}
      {days.map((day) => {
        const key = format(day, "yyyy-MM-dd")
        const events = eventMap.get(key) ?? []
        const inMonth = isSameMonth(day, now)
        const today = isToday(day)

        return (
          <Card
            key={key}
            className={`min-h-28 p-2 ${today ? "ring-2 ring-blue-600" : ""} ${inMonth ? "" : "opacity-50"}`}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium">{format(day, "d")}</span>
              {events.length ? (
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800">
                  {events.length} event{events.length > 1 ? "s" : ""}
                </span>
              ) : null}
            </div>
            <ul className="space-y-1">
              {events.slice(0, 3).map((e, i) => (
                <li key={i} className="truncate text-xs">
                  <span className="mr-1 text-blue-600">{e.time ?? ""}</span>
                  <span className="text-foreground">{e.title}</span>
                </li>
              ))}
              {events.length > 3 && <li className="text-[11px] text-muted-foreground">+{events.length - 3} more</li>}
            </ul>
          </Card>
        )
      })}
    </div>
  )
}
