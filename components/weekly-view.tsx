"use client"
import { Card } from "@/components/ui/card"
import { startOfWeek } from "date-fns"
import type { CombinedData, DayName } from "@/lib/types"

type Props = { data: CombinedData }

const DAYS: DayName[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map((n) => Number.parseInt(n, 10))
  if (Number.isNaN(h)) return 0
  return h * 60 + (Number.isNaN(m) ? 0 : m)
}

function fmtRange(start: string, minutes: number) {
  const s = toMinutes(start)
  const e = s + minutes
  const label = (mins: number) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    const hour12 = ((h + 11) % 12) + 1
    const ampm = h < 12 ? "AM" : "PM"
    return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`
  }
  return `${label(s)} - ${label(e)}`
}

export function WeeklyView({ data }: Props) {
  const periodMinutes = 60
  const timeSet = new Set<string>()
  const cells = new Map<
    string,
    { title: string; type?: string; room?: string; teacher?: string; code?: string }
  >()

  const classesArray = Array.isArray(data.classes)
    ? data.classes
    : Object.values(data.classes ?? {})
  const clsMap = new Map(classesArray.map((c) => [c.id, c]))

  // Handle the time data structure properly
  const timeData = (data as any).time ?? {}
  
  // Process each day's schedule
  for (const [day, schedule] of Object.entries(timeData)) {
    if (Array.isArray(schedule)) {
      for (const entry of schedule) {
        timeSet.add(entry.time)
        const cls = clsMap.get(entry.id)
        
        // Store with day|time as key for proper lookup
        cells.set(`${day}|${entry.time}`, {
          title: data.classes[entry.id]?.title || "Free Period",
          type: entry?.type,
          room: cls?.room,
          teacher: data.classes[entry.id]?.teacher,
        })
      }
    }
  }

  const rows = Array.from(timeSet).sort((a, b) => toMinutes(a) - toMinutes(b))

  return (
    <Card className="overflow-x-auto">
      <div className="min-w-[760px]">
        {/* Header */}
        <div className="grid grid-cols-[160px_repeat(6,1fr)] border-b bg-muted/30 text-xs font-medium">
          <div className="px-3 py-2">Time</div>
          {DAYS.map((d) => (
            <div key={d} className="px-3 py-2 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>
        {/* Body */}
        <div className="divide-y">
          {rows.map((t) => (
            <div key={t} className="grid grid-cols-[160px_repeat(6,1fr)]">
              <div className="px-3 py-3 text-sm text-muted-foreground">
                {fmtRange(t, periodMinutes)}
              </div>
              {DAYS.map((d) => {
                const v = cells.get(`${d}|${t}`)
                return (
                  <div key={`${d}-${t}`} className="border-l px-3 py-3">
                    {v ? (
                      <div className="space-y-0.5 leading-tight">
                        <div className="text-sm font-semibold">{v.title}</div>
                        {v.type && (
                          <div className="text-xs text-muted-foreground capitalize">
                            {v.type}
                          </div>
                        )}
                        {(v.room || v.teacher) && (
                          <div className="text-xs text-muted-foreground">
                            {v.room ? v.room : ""} {v.teacher ? `• ${v.teacher}` : ""}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-sm text-muted-foreground">-</div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
