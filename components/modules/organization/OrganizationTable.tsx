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
import { MoreVertical, Eye, RefreshCw, Users, Trash2 } from 'lucide-react'
import type { Organization } from '@/types/organization'
import { getMouStatus, getDaysUntilExpiry } from '@/lib/mou-utils'
import { getInitials, getAvatarColor, formatDate } from '@/lib/stages'
import { cn } from '@/lib/utils'

interface OrganizationTableProps {
  organizations: Organization[]
  onRenewMou: (org: Organization) => void
  onReallocate: (org: Organization) => void
  onDelete: (id: number) => void
  canDelete: boolean
}

export function OrganizationTable({
  organizations,
  onRenewMou,
  onReallocate,
  onDelete,
  canDelete,
}: OrganizationTableProps) {
  const router = useRouter()
  return (
    <div
      className="rounded-lg border border-border overflow-hidden shadow-sm"
      role="region"
      aria-label="Organizations table"
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50 border-border">
            <TableHead className="font-semibold text-foreground" scope="col">
              Organization Name
            </TableHead>
            <TableHead className="font-semibold text-foreground" scope="col">
              Location
            </TableHead>
            <TableHead className="font-semibold text-foreground" scope="col">
              Assigned CO
            </TableHead>
            <TableHead className="font-semibold text-foreground" scope="col">
              MOU End Date
            </TableHead>
            <TableHead className="font-semibold text-foreground" scope="col">
              Child Count
            </TableHead>
            <TableHead className="w-10" scope="col">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.map((org) => {
            const mouStatus = getMouStatus(org.activeMou?.mou_end_date)
            const daysLeft = getDaysUntilExpiry(org.activeMou?.mou_end_date)
            const coName = org.latestCo?.co?.user_display_name ?? '—'
            const isUrgent = mouStatus.urgent

            return (
              <TableRow
                key={org.id}
                className={cn(
                  'cursor-pointer hover:bg-muted/30 border-border transition-colors',
                  isUrgent && 'border-l-2 border-l-orange-400'
                )}
                onClick={() => router.push(`/organization/${org.id}`)}
              >
                {/* Organization Name */}
                <TableCell>
                  <span className="font-medium text-foreground">{org.partner_name}</span>
                </TableCell>

                {/* Location */}
                <TableCell className="text-muted-foreground text-sm">
                  {org.city?.city_name && org.state?.state_name
                    ? `${org.city.city_name}, ${org.state.state_name}`
                    : '—'}
                </TableCell>

                {/* Assigned CO */}
                <TableCell>
                  {org.latestCo ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7">
                        <AvatarFallback
                          className={cn('text-xs text-white', getAvatarColor(coName))}
                        >
                          {getInitials(coName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground">{coName}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>

                {/* MOU End Date + badge */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-col gap-1">
                    {org.activeMou?.mou_end_date ? (
                      <>
                        <span className="text-sm text-foreground">
                          {formatDate(org.activeMou.mou_end_date)}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            'w-fit text-xs',
                            mouStatus.bgColor,
                            mouStatus.color,
                            mouStatus.borderColor
                          )}
                        >
                          {mouStatus.label}
                          {daysLeft >= 0 && daysLeft < 60 && ` · ${daysLeft}d`}
                        </Badge>
                      </>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </div>
                </TableCell>

                {/* Child Count */}
                <TableCell className="text-sm text-foreground">
                  {org.activeMou?.confirmed_child_count ?? '—'}
                </TableCell>

                {/* Actions */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label="Actions"
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/organization/${org.id}`)}>
                        <Eye className="size-4 mr-2" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onRenewMou(org)}>
                        <RefreshCw className="size-4 mr-2" /> Renew MOU
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onReallocate(org)}>
                        <Users className="size-4 mr-2" /> Reallocate CO
                      </DropdownMenuItem>
                      {canDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onDelete(org.id)}
                          >
                            <Trash2 className="size-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </>
                      )}
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
