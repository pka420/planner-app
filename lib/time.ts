export const dayNames = ["Sun", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export function parseTimeRange(range: string): [number, number] {
  return [toMinutes(range), toMinutes(range) + 60]
}

export function toMinutes(t: string): number {
  const [hStr, mStr] = t.split(":")
  const h = Number(hStr)
  const m = Number(mStr ?? 0)
  return h * 60 + m
}

export function minutesNowLocal(): number {
  const n = new Date()
  return n.getHours() * 60 + n.getMinutes() - 720
}

