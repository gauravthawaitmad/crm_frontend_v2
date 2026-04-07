'use client'

import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative max-w-md">
      <label htmlFor="lead-search" className="sr-only">
        Search leads by partner name or address
      </label>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />
      <Input
        id="lead-search"
        type="text"
        placeholder="Search by partner name or address..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 bg-background border-border/50 hover:border-border transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        aria-label="Search leads"
      />
    </div>
  )
}
