"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { PlannerData } from "@/lib/types"
import { format, parseISO } from "date-fns"

type Props = { data: PlannerData }

const statusColor: Record<string, string> = {
  "not-started": "bg-gray-100 text-gray-800",
  "in-progress": "bg-blue-100 text-blue-800",
  done: "bg-green-100 text-green-800",
}

export function MilestoneView({ data }: Props) {
  const milestones = [...(data.milestones || [])].sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""))

  return (
    <div className="grid gap-3">
      {milestones.map((m) => (
        <Card key={m.id}>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-pretty text-base font-semibold">{m.title}</h3>
                {m.description && <p className="mt-1 max-w-prose text-sm text-muted-foreground">{m.description}</p>}
                {m.tags?.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.tags.map((t) => (
                      <Badge key={t} variant="outline">
                        {t}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`inline-flex rounded px-2 py-1 text-xs font-medium ${statusColor[m.status] ?? "bg-gray-100 text-gray-800"}`}
                >
                  {labelForStatus(m.status)}
                </span>
                {m.dueDate && (
                  <span className="text-xs text-muted-foreground">
                    Due {format(parseISO(m.dueDate), "MMM d, yyyy")}
                  </span>
                )}
                {typeof m.progress === "number" && (
                  <div className="w-36">
                    <div className="h-2 w-full rounded bg-gray-100">
                      <div
                        className="h-2 rounded bg-blue-600"
                        style={{ width: `${Math.max(0, Math.min(100, m.progress))}%` }}
                        aria-label="progress"
                      />
                    </div>
                    <div className="mt-1 text-right text-[11px] text-muted-foreground">{m.progress}%</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {!milestones.length && <p className="text-sm text-muted-foreground">No milestones.</p>}
    </div>
  )
}

function labelForStatus(s: string) {
  switch (s) {
    case "not-started":
      return "Not started"
    case "in-progress":
      return "In progress"
    case "done":
      return "Done"
    default:
      return s
  }
}
