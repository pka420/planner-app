"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Props = {
  value: string
  onChange: (v: string) => void
}

const DATASETS = [
  { id: "dse", label: "DSE" },
  { id: "ge", label: "2 GEs" },
]

export function DatasetSwitcher({ value, onChange }: Props) {
  return (
    <div className="grid gap-1">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="dataset" className="w-56">
          <SelectValue placeholder="Choose dataset" />
        </SelectTrigger>
        <SelectContent>
          {DATASETS.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
