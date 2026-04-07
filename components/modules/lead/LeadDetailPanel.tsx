'use client'

import { useState } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Trash2, MapPin } from 'lucide-react'
import type { Lead, LeadDetail } from '@/types/lead'
import {
  STAGE_CONFIG,
  getInitials,
  getAvatarColor,
  formatDate,
} from '@/lib/stages'
import { useAppSelector } from '@/store/hooks'
import { PocTabContent } from '@/components/modules/poc/PocTabContent'

interface LeadDetailPanelProps {
  lead: Lead | LeadDetail | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (lead: Lead | LeadDetail) => void
  onDelete?: (id: number) => void
}

export function LeadDetailPanel({
  lead,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: LeadDetailPanelProps) {
  const userRole = useAppSelector((s) => s.auth.user?.user_role)
  const canDelete = userRole === 'super_admin' || userRole === 'admin'

  if (!lead) return null

  // Normalize: detail has `currentStage`; list item has `latestAgreement`
  const latestAgreement =
    'latestAgreement' in lead ? lead.latestAgreement : undefined
  const stage =
    ('currentStage' in lead ? lead.currentStage : undefined) ??
    latestAgreement?.conversion_stage

  const stageConfig = stage && stage in STAGE_CONFIG ? STAGE_CONFIG[stage] : null

  const co = lead.latestCo?.co
  const poc = lead.latestPoc

  const trackingHistory =
    'tracking_history' in lead ? lead.tracking_history : undefined

  const location = [
    lead.address_line_1,
    lead.address_line_2,
    lead.city?.city_name,
    lead.state?.state_name,
    lead.pincode?.toString(),
  ]
    .filter(Boolean)
    .join(', ')

  const handleDelete = () => {
    if (onDelete && window.confirm(`Delete "${lead.partner_name}"? This cannot be undone.`)) {
      onDelete(lead.id)
      onClose()
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent className="!w-[420px] !max-w-[100vw] h-full flex flex-col overflow-hidden">
        {/* Header */}
        <DrawerHeader className="border-b border-border pb-4">
          <div className="flex items-start gap-3">
            <Avatar className={`w-12 h-12 shrink-0 ${getAvatarColor(lead.partner_name)}`}>
              <AvatarFallback className="text-base font-semibold text-white">
                {getInitials(lead.partner_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <DrawerTitle className="text-xl leading-tight truncate">
                {lead.partner_name}
              </DrawerTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{lead.lead_source}</p>
            </div>
          </div>
          {stageConfig && (
            <span
              className={`inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full text-xs font-medium w-fit ${stageConfig.color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${stageConfig.dot}`} />
              {stageConfig.label}
            </span>
          )}
        </DrawerHeader>

        {/* Tabs */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="poc">POC</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            {/* ── Overview ── */}
            <TabsContent value="overview" className="space-y-5">
              {/* Address */}
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                  Address
                </p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{location || '—'}</p>
                </div>
              </div>

              <Separator />

              {/* Assigned CO */}
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                  Assigned CO
                </p>
                {co ? (
                  <div className="flex items-center gap-3">
                    <Avatar className={`w-9 h-9 ${getAvatarColor(co.user_display_name)}`}>
                      <AvatarFallback className="text-xs font-semibold text-white">
                        {getInitials(co.user_display_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {co.user_display_name}
                      </p>
                      <p className="text-xs text-muted-foreground">{co.user_role}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Unassigned</p>
                )}
              </div>

              {/* Potential child count */}
              {latestAgreement?.potential_child_count != null && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                      Potential Students
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {latestAgreement.potential_child_count}
                    </p>
                  </div>
                </>
              )}

              {/* Stage-specific context */}
              {latestAgreement?.current_status && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                      Current Status
                    </p>
                    <p className="text-sm text-foreground">{latestAgreement.current_status}</p>
                  </div>
                </>
              )}

              {latestAgreement?.non_conversion_reason && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                      Reason
                    </p>
                    <p className="text-sm text-foreground">{latestAgreement.non_conversion_reason}</p>
                  </div>
                </>
              )}
            </TabsContent>

            {/* ── POC ── */}
            <TabsContent value="poc" className="space-y-4">
              <PocTabContent partnerId={lead.id} />
            </TabsContent>

            {/* ── Timeline ── */}
            <TabsContent value="timeline" className="space-y-2">
              {trackingHistory && trackingHistory.length > 0 ? (
                <div className="space-y-0">
                  {trackingHistory.map((entry, idx) => {
                    const entryConfig = STAGE_CONFIG[entry.stage]
                    return (
                      <div key={idx} className="flex gap-3 pb-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${entryConfig?.dot ?? 'bg-muted-foreground'}`} />
                          {idx < trackingHistory.length - 1 && (
                            <div className="w-0.5 flex-1 bg-border my-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${entryConfig?.color ?? 'bg-muted text-muted-foreground'}`}
                          >
                            {entryConfig?.label ?? entry.stage}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(entry.date)}
                          </p>
                          {entry.details?.current_status && (
                            <p className="text-xs text-foreground mt-1">
                              {entry.details.current_status}
                            </p>
                          )}
                          {entry.details?.non_conversion_reason && (
                            <p className="text-xs text-foreground mt-1">
                              {entry.details.non_conversion_reason}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No stage history available.
                  <br />
                  Click a row to load full details.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <DrawerFooter className="border-t border-border gap-2">
          {onEdit && (
            <Button className="bg-primary text-white hover:bg-primary/90" onClick={() => onEdit(lead)}>
              Edit / Update Stage
            </Button>
          )}
          <div className="flex gap-2">
            <DrawerClose asChild>
              <Button variant="outline" className="flex-1">
                Close
              </Button>
            </DrawerClose>
            {canDelete && onDelete && (
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            )}
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
