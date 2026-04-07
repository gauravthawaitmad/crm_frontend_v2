'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Phone, Mail, BookUser, ChevronDown, ChevronUp, Plus, Pencil,
  Trash2, CalendarDays, MessageSquare, Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Poc } from '@/types/poc'
import type { Interaction } from '@/hooks/useInteraction'
import { getInitials, getAvatarColor, formatDate, formatRelativeTime } from '@/lib/stages'
import { useAppSelector } from '@/store/hooks'

const TYPE_COLORS: Record<string, string> = {
  'Call': 'bg-blue-100 text-blue-700',
  'In-Person Meeting': 'bg-orange-100 text-orange-700',
  'Site Visit': 'bg-teal-100 text-teal-700',
  'Online Meeting': 'bg-violet-100 text-violet-700',
  'Email': 'bg-slate-100 text-slate-600',
  'WhatsApp': 'bg-green-100 text-green-700',
  'Internal': 'bg-stone-100 text-stone-600',
}

const OUTCOME_COLORS: Record<string, string> = {
  'Positive': 'bg-green-100 text-green-700',
  'Neutral': 'bg-stone-100 text-stone-600',
  'Needs Follow-up': 'bg-amber-100 text-amber-700',
  'No Response': 'bg-red-100 text-red-700',
}

interface PocCardProps {
  poc: Poc
  interactions?: Interaction[]
  onAddMeeting?: (poc: Poc) => void
  onEdit?: (poc: Poc) => void
  onDelete?: (poc: Poc) => void
  onLogInteraction?: (poc: Poc) => void
}

export function PocCard({ poc, interactions = [], onAddMeeting, onEdit, onDelete, onLogInteraction }: PocCardProps) {
  const [showMeetings, setShowMeetings] = useState(false)
  const [showInteractions, setShowInteractions] = useState(false)
  const userRole = useAppSelector((s) => s.auth.user?.user_role)
  const canDelete = userRole === 'super_admin' || userRole === 'admin'
  const canEdit =
    userRole === 'super_admin' ||
    userRole === 'admin' ||
    userRole === 'manager' ||
    userRole === 'CO Full Time' ||
    userRole === 'CO Part Time' ||
    userRole === 'CHO,CO Part Time'

  const meetings = poc.meetings ?? []

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      {/* POC Header */}
      <div className="px-4 py-3 flex items-center gap-3">
        <Avatar className={`w-10 h-10 shrink-0 ${getAvatarColor(poc.poc_name)}`}>
          <AvatarFallback className="text-sm font-semibold text-white">
            {getInitials(poc.poc_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{poc.poc_name}</p>
          {poc.poc_designation && (
            <p className="text-xs text-muted-foreground">{poc.poc_designation}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {canEdit && onLogInteraction && (
            <Button
              variant="ghost" size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-orange-600"
              title="Log interaction with this POC"
              onClick={() => onLogInteraction(poc)}
            >
              <Zap className="w-3.5 h-3.5" />
            </Button>
          )}
          {canEdit && onAddMeeting && (
            <Button
              variant="ghost" size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-primary"
              title="Add meeting"
              onClick={() => onAddMeeting(poc)}
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          )}
          {canEdit && onEdit && (
            <Button
              variant="ghost" size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Edit POC"
              onClick={() => onEdit(poc)}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          )}
          {canDelete && onDelete && (
            <Button
              variant="ghost" size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-red-600"
              title="Delete POC"
              onClick={() => onDelete(poc)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* POC Contact Info */}
      <div className="px-4 pb-3 space-y-1.5">
        {poc.poc_contact && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-foreground">{poc.poc_contact}</span>
          </div>
        )}
        {poc.poc_email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <a href={`mailto:${poc.poc_email}`} className="text-primary hover:underline">
              {poc.poc_email}
            </a>
          </div>
        )}
        {poc.date_of_first_contact && (
          <div className="flex items-center gap-2 text-sm">
            <BookUser className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">First contact: {formatDate(poc.date_of_first_contact)}</span>
          </div>
        )}
      </div>

      {/* Interactions section */}
      {interactions.length > 0 && (
        <>
          <button
            onClick={() => setShowInteractions(!showInteractions)}
            className="w-full flex items-center justify-between px-4 py-2 bg-muted/40 border-t border-border text-xs font-medium text-muted-foreground hover:bg-muted/60 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              {interactions.length} interaction{interactions.length !== 1 ? 's' : ''}
            </span>
            {showInteractions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showInteractions && (
            <div className="px-4 py-3 space-y-2 border-t border-border bg-muted/10">
              {interactions.map((ix) => (
                <div key={ix.id} className="flex items-start gap-2 py-1.5 border-b border-border/50 last:border-0">
                  <span className={cn('mt-0.5 inline-flex px-2 py-0.5 rounded-full text-xs font-medium shrink-0', TYPE_COLORS[ix.interaction_type] ?? 'bg-stone-100 text-stone-600')}>
                    {ix.interaction_type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground line-clamp-2">{ix.summary}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(ix.interaction_date)}</span>
                      {ix.outcome && (
                        <span className={cn('px-1.5 py-0.5 rounded text-xs', OUTCOME_COLORS[ix.outcome] ?? 'bg-stone-100 text-stone-600')}>
                          {ix.outcome}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Meeting Toggle */}
      {meetings.length > 0 && (
        <>
          <button
            onClick={() => setShowMeetings(!showMeetings)}
            className="w-full flex items-center justify-between px-4 py-2 bg-muted/40 border-t border-border text-xs font-medium text-muted-foreground hover:bg-muted/60 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              {meetings.length} meeting{meetings.length !== 1 ? 's' : ''}
            </span>
            {showMeetings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showMeetings && (
            <div className="px-4 py-3 space-y-3 border-t border-border bg-muted/20">
              {meetings.map((m) => (
                <div key={m.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                    <div className="w-px flex-1 bg-border my-1" />
                  </div>
                  <div className="flex-1 pb-1">
                    <p className="text-xs font-medium text-foreground">{formatDate(m.meeting_date)}</p>
                    {m.meeting_notes && (
                      <div className="flex items-start gap-1.5 mt-1">
                        <MessageSquare className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground leading-relaxed">{m.meeting_notes}</p>
                      </div>
                    )}
                    {m.follow_up_meeting_scheduled && m.follow_up_meeting_date && (
                      <p className="text-xs text-warning mt-1">Follow-up: {formatDate(m.follow_up_meeting_date)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* No meetings yet */}
      {meetings.length === 0 && canEdit && onAddMeeting && (
        <div className="px-4 py-2 border-t border-border bg-muted/20">
          <button
            onClick={() => onAddMeeting(poc)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add first meeting note
          </button>
        </div>
      )}
    </div>
  )
}
