"use client"

import { useEffect, useMemo, useState } from "react"
import type { ScheduleData, Slot } from "@/lib/types"
import { dayNames, parseTimeRange, minutesNowLocal } from "@/lib/time"

export function DailyView({ data }: { data: ScheduleData }) {
  const todayIdx = new Date().getDay() // 0-6
  const defaultDay = todayIdx === 0 ? 1 : todayIdx // default to Monday when Sunday
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[1, 2, 3, 4, 5, 6].map((d) => {
          const isToday = d === (todayIdx === 0 ? 1 : todayIdx)
          const active = d === activeDay
          return (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={`relative rounded-full px-3 py-1.5 text-xs font-medium ${
                active ? "bg-teal-600 text-white" : "bg-gray-900 text-gray-300 hover:bg-gray-800"
              }`}
              aria-pressed={active}
            >
              {dayNames[d].slice(0, 3)}
              {isToday && (
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${active ? "bg-white/20 text-white" : "bg-gray-700 text-gray-100"}`}
                >
                  Today
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="rounded-md border border-gray-700 bg-gray-900 px-4 py-2 text-sm">
        <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-teal-500 align-middle" />
          <NextUp data={data} enriched={enriched} now={now} />
      </div>

      <div className="flex flex-col gap-3">
        {enriched.map((s, i) => {
          const [st, en] = parseTimeRange(s.time)
          const isCurrent = s.title !== "Free Period" && now >= st && now < en
          const isPast = now >= en
          const isFree = s.title === "Free Period"
          return (
            <div
              key={`${s.title}-${s.time}-${i}`}
              className={[
                "rounded-xl border px-4 py-3 transition-colors",
                "border-gray-800 bg-gray-900",
                isPast && !isCurrent ? "opacity-50" : "",
                isCurrent ? "ring-2 ring-amber-400 bg-amber-500/15" : "",
              ].join(" ")}
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5 shrink-0 rounded-full bg-gray-800 px-2 py-0.5 text-[11px] text-gray-200">
                  {s.time}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className={`h-5 w-1.5 rounded-full ${isFree ? "bg-gray-600" : "bg-teal-500"}`} />
                    <h3 className="truncate text-md font-semibold text-gray-100">
                      {data.classes[s.id] && <div>{data.classes[s.id].title}</div>}
                      {isFree && <div className="italic text-gray-400">Free Period</div>}
                                        </h3>
                  </div>
                  {s.room || s.teacher || s.type || isFree ? (
                    <div className="flex items-center justify-between">
                    <div className="mt-1 space-y-0.5 text-[12px] leading-5 text-gray-300">
                      {s.room && <div>{s.room}</div>}
                      {data.classes[s.id] && <div>{data.classes[s.id].teacher}</div>}
                      </div>
                      {s.type && !isFree && <div className="text-gray-400 text-sm font-semibold float-right">{s.type}</div>}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function NextUp({ data, enriched, now }: { data: {}, enriched: Slot[]; now: number }) {
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
      <span className="text-gray-100">
        <span className="font-semibold">{data.classes[ongoing.id].title}</span> 
      </span>
    )
  }

  if (next) {
    return (
      <span className="text-gray-100">
        No current class - Next:{" "}
        <span className="font-semibold">{next.title}</span> at {next.time.split("-")[0]}
      </span>
    )
  }

  return <span className="text-gray-100">No more classes today</span>
}

function toLabel(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const hh = h > 12 ? h - 12 : h
  const pad = String(m).padStart(2, "0")
  return `${hh}:${pad}`
}

