'use client'

import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react'
import type { Lead } from '@/types/lead'
import { STAGE_CONFIG, getInitials, getAvatarColor, formatRelativeTime } from '@/lib/stages'

interface LeadTableProps {
  leads: Lead[]
  onEdit: (lead: Lead) => void
  onDelete: (id: number) => void
}

const SOURCE_COLORS: Record<string, string> = {
  cold_call: 'bg-blue-50 text-blue-700 border-blue-200',
  referral: 'bg-green-50 text-green-700 border-green-200',
  field_visit: 'bg-purple-50 text-purple-700 border-purple-200',
  event: 'bg-orange-50 text-orange-700 border-orange-200',
  online: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  other: 'bg-slate-50 text-slate-600 border-slate-200',
}

function sourceColor(source: string) {
  return SOURCE_COLORS[source.toLowerCase().replace(' ', '_')] ?? 'bg-slate-50 text-slate-600 border-slate-200'
}

export function LeadTable({ leads, onEdit, onDelete }: LeadTableProps) {
  const router = useRouter()

  return (
    <div
      className="rounded-lg border border-border overflow-hidden shadow-sm"
      role="region"
      aria-label="Leads table"
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50 border-border">
            <TableHead className="font-semibold text-foreground" scope="col">Partner Name</TableHead>
            <TableHead className="font-semibold text-foreground" scope="col">Location</TableHead>
            <TableHead className="font-semibold text-foreground" scope="col">Lead Source</TableHead>
            <TableHead className="font-semibold text-foreground" scope="col">Stage</TableHead>
            <TableHead className="font-semibold text-foreground" scope="col">Assigned CO</TableHead>
            <TableHead className="font-semibold text-foreground" scope="col">Last Updated</TableHead>
            <TableHead className="w-10" scope="col"><span className="sr-only">Actions</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => {
            const stage = lead.latestAgreement?.conversion_stage
            const stageConfig = stage ? STAGE_CONFIG[stage] : null
            const co = lead.latestCo?.co
            const coName = co?.user_display_name ?? '—'
            const location = [lead.city?.city_name, lead.state?.state_name].filter(Boolean).join(', ')

            return (
              <TableRow
                key={lead.id}
                onClick={() => router.push(`/lead/${lead.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    router.push(`/lead/${lead.id}`)
                  }
                }}
                className="cursor-pointer hover:bg-accent/5 transition-colors border-border focus-within:ring-2 focus-within:ring-primary/50"
                role="button"
                tabIndex={0}
                aria-label={`Lead: ${lead.partner_name}, stage: ${stage ?? 'unknown'}`}
              >
                {/* Partner Name */}
                <TableCell className="font-semibold text-foreground">{lead.partner_name}</TableCell>

                {/* Location */}
                <TableCell className="text-muted-foreground text-sm">{location || '—'}</TableCell>

                {/* Lead Source */}
                <TableCell>
                  <Badge className={`border text-xs ${sourceColor(lead.lead_source)}`} variant="outline">
                    {lead.lead_source}
                  </Badge>
                </TableCell>

                {/* Stage */}
                <TableCell>
                  {stageConfig ? (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${stageConfig.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${stageConfig.dot}`} />
                      {stageConfig.label}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>

                {/* Assigned CO */}
                <TableCell>
                  {co ? (
                    <div className="flex items-center gap-2">
                      <Avatar className={`w-7 h-7 ${getAvatarColor(coName)}`}>
                        <AvatarFallback className="text-xs font-semibold text-white">
                          {getInitials(coName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground truncate max-w-[120px]">{coName}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Unassigned</span>
                  )}
                </TableCell>

                {/* Last Updated */}
                <TableCell className="text-muted-foreground text-sm">
                  {formatRelativeTime(lead.updatedAt)}
                </TableCell>

                {/* Actions — stop propagation so row click doesn't fire */}
                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/lead/${lead.id}`)}>
                        <Eye className="h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(lead)}>
                        <Pencil className="h-4 w-4" />
                        Edit / Update Stage
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(lead.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
