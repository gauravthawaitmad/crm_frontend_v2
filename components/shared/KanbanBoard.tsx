'use client'

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  useDroppable,
  useDraggable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface KanbanColumn {
  id: string
  label: string
  /** Tailwind border-l color class, e.g. 'border-l-blue-400' */
  borderColor: string
  /** Tailwind bg class for the dot, e.g. 'bg-blue-500' */
  dotColor: string
  items: { id: string | number; [key: string]: unknown }[]
}

interface KanbanBoardProps {
  columns: KanbanColumn[]
  renderCard: (item: { id: string | number; [key: string]: unknown }) => React.ReactNode
  onCardMove: (itemId: string, fromColumnId: string, toColumnId: string) => void
}

// ── DraggableCard ─────────────────────────────────────────────────────────────

function DraggableCard({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'cursor-grab active:cursor-grabbing touch-none',
        isDragging && 'opacity-40'
      )}
    >
      {children}
    </div>
  )
}

// ── DroppableColumn ───────────────────────────────────────────────────────────

function DroppableColumn({
  column,
  isOver,
  renderCard,
}: {
  column: KanbanColumn
  isOver: boolean
  renderCard: (item: { id: string | number; [key: string]: unknown }) => React.ReactNode
}) {
  const { setNodeRef } = useDroppable({ id: column.id })

  return (
    <div className="flex flex-col shrink-0" style={{ width: 280 }}>
      {/* Column header */}
      <div
        className={cn(
          'bg-white rounded-t-xl border-l-4 px-3 py-2.5 flex items-center gap-2 shadow-sm',
          column.borderColor
        )}
      >
        <span className={cn('w-2 h-2 rounded-full shrink-0', column.dotColor)} />
        <span className="text-sm font-semibold text-stone-700 flex-1 truncate">
          {column.label}
        </span>
        <span className="text-xs text-stone-400 font-medium bg-stone-100 px-1.5 py-0.5 rounded-full">
          {column.items.length}
        </span>
      </div>

      {/* Card list — droppable area */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 rounded-b-xl p-2 space-y-2 overflow-y-auto transition-colors duration-150',
          'max-h-[70vh]',
          isOver
            ? 'bg-orange-50 ring-2 ring-inset ring-orange-300'
            : 'bg-stone-100'
        )}
      >
        {column.items.length === 0 ? (
          <div className="border-2 border-dashed border-stone-200 rounded-lg p-6 text-center mt-1">
            <p className="text-xs text-stone-400">No leads here</p>
          </div>
        ) : (
          column.items.map((item) => (
            <DraggableCard key={String(item.id)} id={String(item.id)}>
              {renderCard(item)}
            </DraggableCard>
          ))
        )}
      </div>
    </div>
  )
}

// ── KanbanBoard ───────────────────────────────────────────────────────────────

export function KanbanBoard({ columns, renderCard, onCardMove }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overColumnId, setOverColumnId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // 8px threshold so simple clicks still fire onClick on card children
      activationConstraint: { distance: 8 },
    })
  )

  function findItemColumn(itemId: string): string | null {
    for (const col of columns) {
      if (col.items.some((item) => String(item.id) === itemId)) return col.id
    }
    return null
  }

  const activeItem = activeId
    ? columns.flatMap((c) => c.items).find((item) => String(item.id) === activeId)
    : null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragOver(event: DragOverEvent) {
    setOverColumnId(event.over ? String(event.over.id) : null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    setOverColumnId(null)
    if (!over) return

    const fromColumnId = findItemColumn(String(active.id))
    const toColumnId = String(over.id)

    if (!fromColumnId || fromColumnId === toColumnId) return
    onCardMove(String(active.id), fromColumnId, toColumnId)
  }

  function handleDragCancel() {
    setActiveId(null)
    setOverColumnId(null)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-6">
        {columns.map((column) => (
          <DroppableColumn
            key={column.id}
            column={column}
            isOver={overColumnId === column.id}
            renderCard={renderCard}
          />
        ))}
      </div>

      {/* Ghost card shown floating at cursor while dragging */}
      <DragOverlay>
        {activeItem ? (
          <div className="rotate-1 scale-[1.03] shadow-xl opacity-95 cursor-grabbing">
            {renderCard(activeItem)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
