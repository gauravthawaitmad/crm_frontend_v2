'use client'

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
import {
  Trash2,
  MapPin,
  Users,
  RefreshCw,
  ExternalLink,
  FileText,
  Clock,
} from 'lucide-react'
import type { Organization, OrganizationDetail } from '@/types/organization'
import { getMouStatus, getDaysUntilExpiry } from '@/lib/mou-utils'
import { getInitials, getAvatarColor, formatDate } from '@/lib/stages'
import { useAppSelector } from '@/store/hooks'
import { cn } from '@/lib/utils'
import { PocTabContent } from '@/components/modules/poc/PocTabContent'

interface OrganizationDetailPanelProps {
  org: Organization | OrganizationDetail | null
  isOpen: boolean
  onClose: () => void
  onRenewMou?: (org: Organization) => void
  onReallocate?: (org: Organization) => void
  onDelete?: (id: number) => void
}

export function OrganizationDetailPanel({
  org,
  isOpen,
  onClose,
  onRenewMou,
  onReallocate,
  onDelete,
}: OrganizationDetailPanelProps) {
  const userRole = useAppSelector((s) => s.auth.user?.user_role)
  const canDelete = userRole === 'super_admin' || userRole === 'admin'
  const canRenew = ['super_admin', 'admin', 'manager'].includes(userRole ?? '')
  const canReallocate = userRole === 'super_admin' || userRole === 'admin'

  if (!org) return null

  const coName = org.latestCo?.co?.user_display_name ?? '—'
  const activeMou = org.activeMou
  const mouStatus = getMouStatus(activeMou?.mou_end_date)
  const daysLeft = getDaysUntilExpiry(activeMou?.mou_end_date)

  // MOU history (only available on detail response)
  const mouHistory = (org as OrganizationDetail).mouHistory ?? []

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()} direction="right">
      <DrawerContent className="h-full w-full max-w-md ml-auto rounded-none flex flex-col">
        {/* Header */}
        <DrawerHeader className="border-b border-border pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <DrawerTitle className="text-lg font-semibold truncate">
                {org.partner_name}
              </DrawerTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {org.city?.city_name && org.state?.state_name
                  ? `${org.city.city_name}, ${org.state.state_name}`
                  : '—'}
              </p>
            </div>
            {/* MOU status badge (prominent) */}
            {activeMou && (
              <Badge
                variant="outline"
                className={cn(
                  'shrink-0 text-xs',
                  mouStatus.bgColor,
                  mouStatus.color,
                  mouStatus.borderColor
                )}
              >
                {mouStatus.label}
              </Badge>
            )}
          </div>
        </DrawerHeader>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-4 mt-3 w-auto justify-start bg-muted/50 h-9">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="mou" className="text-xs">Active MOU</TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              MOU History
              {mouHistory.length > 0 && (
                <span className="ml-1 rounded-full bg-muted-foreground/20 px-1.5 text-[10px]">
                  {mouHistory.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="pocs" className="text-xs">POCs</TabsTrigger>
          </TabsList>

          {/* ── Overview Tab ───────────────────────────────────────────────── */}
          <TabsContent value="overview" className="flex-1 overflow-y-auto px-4 pb-4 mt-4">
            <div className="space-y-4">
              {/* Basic Info */}
              <section>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Location
                </h4>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p>{org.address_line_1}</p>
                    {org.address_line_2 && <p>{org.address_line_2}</p>}
                    <p className="text-muted-foreground">
                      {org.city?.city_name}, {org.state?.state_name} — {org.pincode}
                    </p>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Assigned CO */}
              <section>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Assigned CO
                </h4>
                {org.latestCo ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className={cn('text-sm text-white', getAvatarColor(coName))}>
                        {getInitials(coName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{coName}</p>
                      <p className="text-xs text-muted-foreground">
                        {org.latestCo.co?.user_role ?? ''}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No CO assigned</p>
                )}
              </section>

              <Separator />

              {/* MOU expiry quick view */}
              {activeMou && (
                <section>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    MOU Expiry
                  </h4>
                  <div className={cn(
                    'rounded-md border px-3 py-2',
                    mouStatus.bgColor,
                    mouStatus.borderColor
                  )}>
                    <p className={cn('text-2xl font-bold', mouStatus.color)}>
                      {daysLeft < 0 ? 'Expired' : `${daysLeft} days`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {daysLeft < 0 ? 'expired on' : 'until'}{' '}
                      {formatDate(activeMou.mou_end_date ?? '')}
                    </p>
                  </div>
                </section>
              )}

              {/* Meta */}
              <Separator />
              <section>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Details
                </h4>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Lead Source</dt>
                    <dd className="font-medium capitalize">{org.lead_source ?? '—'}</dd>
                  </div>
                  {org.partner_affiliation_type && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Affiliation</dt>
                      <dd className="font-medium">{org.partner_affiliation_type}</dd>
                    </div>
                  )}
                  {org.school_type && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">School Type</dt>
                      <dd className="font-medium">{org.school_type}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Created</dt>
                    <dd className="font-medium">{formatDate(org.createdAt)}</dd>
                  </div>
                </dl>
              </section>
            </div>
          </TabsContent>

          {/* ── Active MOU Tab ─────────────────────────────────────────────── */}
          <TabsContent value="mou" className="flex-1 overflow-y-auto px-4 pb-4 mt-4">
            {activeMou ? (
              <div className="space-y-4">
                {/* Days until expiry — large display */}
                <div className={cn(
                  'rounded-lg border px-4 py-3 text-center',
                  mouStatus.bgColor,
                  mouStatus.borderColor
                )}>
                  <p className={cn('text-4xl font-bold', mouStatus.color)}>
                    {daysLeft < 0 ? '—' : daysLeft}
                  </p>
                  <p className={cn('text-sm mt-0.5', mouStatus.color)}>
                    {daysLeft < 0 ? 'MOU Expired' : 'days until expiry'}
                  </p>
                </div>

                {/* MOU details */}
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Sign Date</dt>
                    <dd className="font-medium">{formatDate(activeMou.mou_sign_date ?? '')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Start Date</dt>
                    <dd className="font-medium">{formatDate(activeMou.mou_start_date ?? '')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">End Date</dt>
                    <dd className="font-medium">{formatDate(activeMou.mou_end_date ?? '')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Confirmed Children</dt>
                    <dd className="font-bold text-base">{activeMou.confirmed_child_count ?? '—'}</dd>
                  </div>
                </dl>

                {/* Download MOU document */}
                {activeMou.mou_url && (
                  <a
                    href={activeMou.mou_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-primary hover:bg-muted/30 transition-colors"
                  >
                    <FileText className="size-4 shrink-0" />
                    Download MOU Document
                    <ExternalLink className="size-3 ml-auto" />
                  </a>
                )}

                {/* Renew MOU */}
                {canRenew && onRenewMou && (
                  <Button
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary/5"
                    onClick={() => onRenewMou(org)}
                  >
                    <RefreshCw className="size-4 mr-2" />
                    Renew MOU
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="size-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No active MOU found</p>
                {canRenew && onRenewMou && (
                  <Button
                    variant="outline"
                    className="mt-4 border-primary text-primary"
                    onClick={() => onRenewMou(org)}
                  >
                    <RefreshCw className="size-4 mr-2" />
                    Create MOU
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* ── MOU History Tab ────────────────────────────────────────────── */}
          <TabsContent value="history" className="flex-1 overflow-y-auto px-4 pb-4 mt-4">
            {mouHistory.length > 0 ? (
              <div className="space-y-3">
                {mouHistory.map((mou) => (
                  <div
                    key={mou.id}
                    className="rounded-md border border-border px-3 py-2.5 text-sm space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="size-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Renewed on {formatDate(mou.createdAt)}
                      </span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        Inactive
                      </Badge>
                    </div>
                    <dl className="space-y-0.5 mt-1">
                      <div className="flex justify-between text-xs">
                        <dt className="text-muted-foreground">Period</dt>
                        <dd>
                          {formatDate(mou.mou_start_date ?? '')} → {formatDate(mou.mou_end_date ?? '')}
                        </dd>
                      </div>
                      <div className="flex justify-between text-xs">
                        <dt className="text-muted-foreground">Children</dt>
                        <dd>{mou.confirmed_child_count ?? '—'}</dd>
                      </div>
                    </dl>
                    {mou.mou_url && (
                      <a
                        href={mou.mou_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                      >
                        <FileText className="size-3" />
                        View document
                        <ExternalLink className="size-2.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="size-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No MOU history yet</p>
              </div>
            )}
          </TabsContent>

          {/* ── POCs Tab ───────────────────────────────────────────────────── */}
          <TabsContent value="pocs" className="flex-1 overflow-y-auto px-4 pb-4 mt-4">
            <PocTabContent partnerId={org.id} />
          </TabsContent>
        </Tabs>

        {/* Footer actions */}
        <DrawerFooter className="border-t border-border pt-3 flex-row gap-2">
          {canReallocate && onReallocate && (
            <Button
              variant="outline"
              className="flex-1 border-primary text-primary hover:bg-primary/5"
              onClick={() => onReallocate(org)}
            >
              <Users className="size-4 mr-2" />
              Reallocate CO
            </Button>
          )}
          {canDelete && onDelete && (
            <Button
              variant="outline"
              className="flex-1 border-destructive text-destructive hover:bg-destructive/5"
              onClick={() => onDelete(org.id)}
            >
              <Trash2 className="size-4 mr-2" />
              Delete
            </Button>
          )}
          <DrawerClose asChild>
            <Button variant="ghost" className="flex-1">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
