'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange?: (rating: number) => void
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  readOnly?: boolean
  count?: number
}

const SIZE_MAP = {
  sm: 'size-3',
  md: 'size-5',
  lg: 'size-7',
}

export function StarRating({
  value,
  onChange,
  size = 'md',
  showValue = false,
  readOnly = false,
  count,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0)
  const display = readOnly ? value : (hovered || value)

  const sizeClass = SIZE_MAP[size]

  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = display >= star
          const halfFilled = !filled && display >= star - 0.5

          return (
            <span
              key={star}
              className={cn(
                'relative inline-block',
                !readOnly && 'cursor-pointer transition-transform hover:scale-110'
              )}
              onMouseEnter={() => { if (!readOnly) setHovered(star) }}
              onMouseLeave={() => { if (!readOnly) setHovered(0) }}
              onClick={() => { if (!readOnly && onChange) onChange(star) }}
            >
              {halfFilled ? (
                <span className="relative inline-block">
                  <Star className={cn(sizeClass, 'text-stone-200 fill-stone-200')} />
                  <span
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: '50%' }}
                  >
                    <Star className={cn(sizeClass, 'text-orange-400 fill-orange-400')} />
                  </span>
                </span>
              ) : (
                <Star
                  className={cn(
                    sizeClass,
                    filled
                      ? 'text-orange-400 fill-orange-400'
                      : 'text-stone-200 fill-stone-200'
                  )}
                />
              )}
            </span>
          )
        })}
      </div>

      {showValue && (
        <span className="text-sm text-muted-foreground ml-1">
          {value > 0 ? value.toFixed(1) : '—'}
          {count !== undefined && count > 0 && (
            <span className="ml-0.5 text-xs">({count})</span>
          )}
        </span>
      )}
    </div>
  )
}
