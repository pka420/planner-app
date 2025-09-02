export type Milestone = {
  id: string
  title: string
  description?: string
  status: "not-started" | "in-progress" | "done"
  dueDate?: string // ISO date
  tags?: string[]
  progress?: number // 0-100
}

export type EventItem = {
  date: string // yyyy-MM-dd
  title: string
  description?: string
  time?: string // HH:mm
  tags?: string[]
}

export type PlannerData = {
  milestones: Milestone[]
  events: EventItem[]
}
