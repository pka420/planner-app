"use client"

import { useEffect, useMemo, useState } from "react"
import type { ScheduleData, Slot } from "@/lib/types"
import { dayNames, parseTimeRange, minutesNowLocal } from "@/lib/time"

export function DailyView({ data }: { data: ScheduleData }) {
  const todayIdx = new Date().getDay() 
  const defaultDay = todayIdx === 0 ? 1 : todayIdx 
  const [activeDay, setActiveDay] = useState<number>(() => {
    if (typeof window === "undefined") return defaultDay
    const saved = window.localStorage.getItem("active-day")
    return saved ? Number(saved) : defaultDay
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("active-day", String(activeDay))
    }
  }, [activeDay])

  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const dayKey = dayNames[activeDay] as keyof ScheduleData["week"]
  const slots = (data.time[dayKey] || []) as Slot[]

  const [startMinutes, endMinutes] = useMemo(() => {
    const mins = slots.flatMap((s) => {
      const [st, en] = parseTimeRange(s.time)
      return [st, en]
    })
    const min = mins.length ? Math.min(...mins) : 8 * 60 
    const max = mins.length ? Math.max(...mins) : 17 * 60
    return [min, max]
  }, [slots])

  const enriched = useMemo(() => {
    const sorted = [...slots].sort((a, b) => parseTimeRange(a.time)[0] - parseTimeRange(b.time)[0])
    const withFree: Slot[] = []
    let cursor = startMinutes
    for (const s of sorted) {
      const [st, en] = parseTimeRange(s.time)
      if (st > cursor) {
        withFree.push({
          time: `${toLabel(cursor)}-${toLabel(st)}`,
          title: "Free Period",
          type: "Free",
        })
      }
      withFree.push(s)
      cursor = Math.max(cursor, en)
    }
    if (cursor < endMinutes) {
      withFree.push({
        time: `${toLabel(cursor)}-${toLabel(endMinutes)}`,
        title: "Free Period",
        type: "Free",
      })
    }
    return withFree
  }, [slots, startMinutes, endMinutes])

  const now = minutesNowLocal()
  const currentIdx = enriched.findIndex((s) => {
    const [st, en] = parseTimeRange(s.time)
    return s.title !== "Free Period" && now >= st && now < en
  })

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Day Selection */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5, 6].map((d) => {
          const isToday = d === (todayIdx === 0 ? 1 : todayIdx)
          const active = d === activeDay
          return (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={`relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 shadow-md ${
                active 
                  ? "bg-primary text-primary-foreground shadow-autumn-glow" 
                  : "bg-card text-card-foreground hover:bg-muted border border-border"
              }`}
              aria-pressed={active}
            >
              {dayNames[d].slice(0, 3)}
              {isToday && (
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                    active 
                      ? "bg-primary-foreground/20 text-primary-foreground" 
                      : "bg-accent text-accent-foreground"
                  }`}
                >
                  Today
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Current Class Status */}
      {activeDay === todayIdx && currentIdx !== -1 && (
        <div className="rounded-lg border border-accent/30 bg-gradient-to-r from-accent/10 to-accent/5 px-4 py-3 shadow-golden-glow">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-accent animate-pulse shadow-sm" />
            <NextUp data={data} enriched={enriched} now={now} />
          </div>
        </div>
      )}

      {/* Schedule List */}
      <div className="flex flex-col gap-4">
        {enriched.map((s, i) => {
          const [st, en] = parseTimeRange(s.time)
          const isCurrent = s.title !== "Free Period" && now >= st && now < en
          const isPast = now >= en
          const isFree = s.title === "Free Period"
          const isLab = s.type === "lab"
          
          return (
            <div
              key={`${s.title}-${s.time}-${i}`}
              className={`rounded-xl border px-5 py-4 transition-all duration-300 ${
                isFree 
                  ? "border-muted bg-muted/50 text-muted-foreground" 
                  : isLab
                    ? "border-secondary bg-gradient-to-r from-secondary/20 to-secondary/10 text-foreground shadow-md"
                    : "border-border bg-card text-card-foreground shadow-md"
              } ${
                activeDay === todayIdx ? `
                  ${isPast && !isCurrent ? "opacity-60" : ""}
                  ${isCurrent ? "ring-2 ring-accent bg-accent/10 shadow-golden-glow" : ""}
                ` : ""
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Time Badge */}
                <div className={`mt-1 shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                  isFree 
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary/10 text-primary border border-primary/20"
                }`}>
                  {s.time}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {/* Status Indicator */}
                    <div className={`h-6 w-2 rounded-full ${
                      isFree 
                        ? "bg-muted-foreground/40" 
                        : isLab
                          ? "bg-secondary"
                          : isCurrent
                            ? "bg-accent"
                            : "bg-primary"
                    }`} />
                    
                    {/* Title */}
                    <h3 className="truncate text-lg font-semibold">
                      {data.classes[s.id] && <div>{data.classes[s.id].title}</div>}
                      {isFree && <div className="italic opacity-75">Free Period</div>}
                    </h3>
                  </div>

                  {/* Details */}
                  {(s.room || s.teacher || s.type || isFree) && (
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 text-sm opacity-80">
                        {s.room && <div className="flex items-center gap-2">
                          {s.room}
                        </div>}
                        {data.classes[s.id] && <div className="flex items-center gap-2">
                          {data.classes[s.id].teacher}
                        </div>}
                      </div>
                      {s.type && !isFree && (
                        <div className={`rounded-full px-3 py-1 text-xs font-medium ${
                          isLab 
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-accent/20 text-accent-foreground"
                        }`}>
                          {s.type}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function NextUp({ data, enriched, now }: { data: any, enriched: Slot[]; now: number }) {
  let ongoing: Slot | null = null
  let next: Slot | null = null

  for (const s of enriched) {
    const [st, et] = parseTimeRange(s.time)

    if (now >= st && now < et && s.title !== "Free Period") {
      ongoing = s
      break
    } else if (now < st) {
      if (!next) next = s
    }
  }

  if (ongoing) {
    return (
      <span className="text-foreground">
        Currently in: <span className="font-semibold text-accent">{data.classes[ongoing.id]?.title}</span>
      </span>
    )
  }

  if (next) {
    return (
      <span className="text-foreground">
        No current class - Next: <span className="font-semibold text-primary">{next.title}</span> at {next.time.split("-")[0]}
      </span>
    )
  }

  return <span className="text-foreground">No more classes today - Enjoy your free time! ✨</span>
}

function toLabel(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const hh = h > 12 ? h - 12 : h
  const pad = String(m).padStart(2, "0")
  return `${hh}:${pad}`
}
