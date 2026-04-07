'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ChevronRight,
  MapPin,
  User,
  Calendar,
  FileText,
  Download,
  RefreshCw,
  Users,
  Trash2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MouRenewalForm } from '@/components/modules/organization/MouRenewalForm'
import { ReallocateForm } from '@/components/modules/organization/ReallocateForm'
import { PocTabContent } from '@/components/modules/poc/PocTabContent'
import { CommentSection } from '@/components/modules/comments/CommentSection'
import { useOrganizationDetail, useDeleteOrganization } from '@/hooks/useOrganization'
import { useAppSelector } from '@/store/hooks'
import { getMouStatus, getDaysUntilExpiry } from '@/lib/mou-utils'
import { formatDate, getInitials, getAvatarColor } from '@/lib/stages'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { OrganizationDetail, MouHistoryItem } from '@/types/organization'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function OrganizationDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<'overview' | 'mou-history' | 'pocs' | 'comments'>('overview')
  const [renewOpen, setRenewOpen] = useState(false)
  const [reallocateOpen, setReallocateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const userRole = useAppSelector((s) => s.auth.user?.user_role)
  const canDelete = userRole === 'super_admin' || userRole === 'admin'

  const { data, isLoading, isError } = useOrganizationDetail(Number(id))
  const deleteOrg = useDeleteOrganization()

  const org: OrganizationDetail | undefined = data?.result

  function handleDelete() {
    deleteOrg.mutate(Number(id), {
      onSuccess: () => {
        toast.success('Organization deleted')
        router.push('/organization')
      },
      onError: () => toast.error('Failed to delete organization'),
    })
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-6">
          <div className="w-80 shrink-0 space-y-4">
            <Skeleton className="h-56 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <Skeleton className="flex-1 h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError || !org) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle className="size-10 text-red-400" />
        <p className="text-lg font-medium text-foreground">Organization not found</p>
        <Button variant="outline" onClick={() => router.push('/organization')}>
          <ArrowLeft className="size-4" />
          Back to Organizations
        </Button>
      </div>
    )
  }

  const co = org.latestCo?.co
  const coName = co?.user_display_name ?? '—'
  const location = [org.city?.city_name, org.state?.state_name].filter(Boolean).join(', ')
  const activeMou = org.activeMou
  const mouStatus = getMouStatus(activeMou?.mou_end_date)
  const daysLeft = getDaysUntilExpiry(activeMou?.mou_end_date)

  // For MouRenewalForm / ReallocateForm — they expect Organization shape
  const orgForModals = org

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/organization" className="hover:text-foreground transition-colors">
          Organizations
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground font-medium truncate max-w-xs">{org.partner_name}</span>
      </nav>

      {/* Back button */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/organization')} className="gap-1.5">
          <ArrowLeft className="size-4" />
          Organizations
        </Button>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 items-start">

        {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
        <div className="w-80 shrink-0 space-y-4">

          {/* Card 1 — Organization Info */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-stone-900 leading-tight">
                {org.partner_name}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Converted
              </span>
            </div>

            <div className="space-y-2.5 text-sm">
              {location && (
                <div className="flex items-start gap-2">
                  <MapPin className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="text-foreground">
                    {location}
                    {org.pincode && <span className="text-muted-foreground"> · {org.pincode}</span>}
                    <div className="text-muted-foreground text-xs mt-0.5">
                      {org.address_line_1}
                      {org.address_line_2 && <>, {org.address_line_2}</>}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <User className="size-3.5 text-muted-foreground shrink-0" />
                {co ? (
                  <div className="flex items-center gap-2">
                    <Avatar className={`size-6 ${getAvatarColor(coName)}`}>
                      <AvatarFallback className="text-[10px] font-semibold text-white">
                        {getInitials(coName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-foreground text-sm">{coName}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-3.5 shrink-0" />
                <span>Added {formatDate(org.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Card 2 — Active MOU */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="size-3.5 text-muted-foreground" />
                Active MOU
              </h3>
              {activeMou && (
                <Badge
                  variant="outline"
                  className={cn('text-xs', mouStatus.bgColor, mouStatus.color, mouStatus.borderColor)}
                >
                  {mouStatus.label}
                </Badge>
              )}
            </div>

            {activeMou ? (
              <div className="space-y-2.5 text-sm">
                {/* Days countdown */}
                {daysLeft !== Infinity && (
                  <div className={cn(
                    'text-center py-3 rounded-lg',
                    mouStatus.urgent ? 'bg-red-50' : daysLeft < 60 ? 'bg-amber-50' : 'bg-green-50'
                  )}>
                    <p className={cn(
                      'text-3xl font-bold',
                      mouStatus.urgent ? 'text-red-600' : daysLeft < 60 ? 'text-amber-600' : 'text-green-600'
                    )}>
                      {daysLeft < 0 ? `${Math.abs(daysLeft)}d` : `${daysLeft}d`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {daysLeft < 0 ? 'past expiry' : 'until expiry'}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {activeMou.mou_sign_date && (
                    <MouDateRow label="Signed" date={activeMou.mou_sign_date} />
                  )}
                  {activeMou.mou_start_date && (
                    <MouDateRow label="Start" date={activeMou.mou_start_date} />
                  )}
                  {activeMou.mou_end_date && (
                    <MouDateRow label="End" date={activeMou.mou_end_date} />
                  )}
                  {activeMou.confirmed_child_count != null && (
                    <div>
                      <span className="text-stone-400 uppercase tracking-wide block">Children</span>
                      <span className="text-foreground font-medium">{activeMou.confirmed_child_count.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {activeMou.mou_url && (
                  <a
                    href={activeMou.mou_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <Download className="size-3.5" />
                    Download MOU Document
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active MOU found</p>
            )}
          </div>

          {/* Card 3 — Quick Actions */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-2.5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Quick Actions</h3>
            <Button
              className="w-full bg-primary text-white hover:bg-primary/90"
              onClick={() => setRenewOpen(true)}
            >
              <RefreshCw className="size-4" />
              Renew MOU
            </Button>
            <Button
              variant="outline"
              className="w-full border-primary/30 text-primary hover:bg-primary/5"
              onClick={() => setReallocateOpen(true)}
            >
              <Users className="size-4" />
              Reallocate CO
            </Button>
            {canDelete && (
              <Button
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-4" />
                Delete Organization
              </Button>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Tab bar */}
          <div className="border-b border-border mb-5">
            <nav className="flex gap-0">
              {(['overview', 'mou-history', 'pocs', 'comments'] as const).map((tab) => {
                const labels: Record<string, string> = {
                  overview: 'Overview',
                  'mou-history': 'MOU History',
                  pocs: 'POCs',
                  comments: 'Comments',
                }
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                      activeTab === tab
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {labels[tab]}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* School info */}
              {(org.school_type || org.partner_affiliation_type || org.total_child_count) ? (
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-foreground mb-4">School Information</h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    {org.school_type && <InfoRow label="School Type" value={org.school_type} />}
                    {org.partner_affiliation_type && <InfoRow label="Affiliation" value={org.partner_affiliation_type} />}
                    {org.total_child_count != null && (
                      <InfoRow label="Total Students" value={org.total_child_count.toLocaleString()} />
                    )}
                    {activeMou?.confirmed_child_count != null && (
                      <InfoRow label="Confirmed Beneficiaries" value={activeMou.confirmed_child_count.toLocaleString()} />
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <p className="text-sm text-muted-foreground">No school information recorded</p>
                </div>
              )}

              {/* Conversion info */}
              {org.agreements && org.agreements.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Conversion</h3>
                  <div className="text-sm">
                    <InfoRow
                      label="Converted On"
                      value={formatDate(org.agreements.find(a => a.conversion_stage === 'converted')?.createdAt ?? org.createdAt)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MOU History tab */}
          {activeTab === 'mou-history' && (
            <MouHistoryList mouHistory={org.mouHistory} activeMouId={activeMou?.id} />
          )}

          {/* POCs tab */}
          {activeTab === 'pocs' && (
            <PocTabContent partnerId={org.id} />
          )}

          {/* Comments tab */}
          {activeTab === 'comments' && (
            <CommentSection partnerId={org.id} />
          )}
        </div>
      </div>

      {/* Modals */}
      <MouRenewalForm
        org={orgForModals}
        isOpen={renewOpen}
        onClose={() => setRenewOpen(false)}
      />

      <ReallocateForm
        org={orgForModals}
        isOpen={reallocateOpen}
        onClose={() => setReallocateOpen(false)}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this organization?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{org.partner_name}</strong> and all associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleteOrg.isPending}
            >
              {deleteOrg.isPending && <Loader2 className="size-4 mr-1 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <span className="text-xs font-medium text-stone-400 uppercase tracking-wide block mb-0.5">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  )
}

function MouDateRow({ label, date }: { label: string; date: string }) {
  return (
    <div>
      <span className="text-stone-400 uppercase tracking-wide block">{label}</span>
      <span className="text-foreground font-medium">{formatDate(date)}</span>
    </div>
  )
}

function MouHistoryList({
  mouHistory,
  activeMouId,
}: {
  mouHistory?: MouHistoryItem[]
  activeMouId?: number
}) {
  if (!mouHistory || mouHistory.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">No MOU history available</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {mouHistory.map((mou) => {
        const isActive = mou.id === activeMouId
        const mouSt = getMouStatus(mou.mou_end_date)
        return (
          <div
            key={mou.id}
            className={cn(
              'rounded-xl border p-4 shadow-sm',
              isActive ? 'border-green-200 bg-green-50/40' : 'border-border bg-card'
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {isActive ? 'Current MOU' : 'Previous MOU'}
                </span>
              </div>
              <Badge
                variant="outline"
                className={cn('text-xs', mouSt.bgColor, mouSt.color, mouSt.borderColor)}
              >
                {mouSt.label}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              {mou.mou_sign_date && <MouDateRow label="Signed" date={mou.mou_sign_date} />}
              {mou.mou_start_date && <MouDateRow label="Start" date={mou.mou_start_date} />}
              {mou.mou_end_date && <MouDateRow label="End" date={mou.mou_end_date} />}
              {mou.confirmed_child_count != null && (
                <div>
                  <span className="text-stone-400 uppercase tracking-wide block">Children</span>
                  <span className="text-foreground font-medium">{mou.confirmed_child_count}</span>
                </div>
              )}
            </div>
            {mou.mou_url && (
              <a
                href={mou.mou_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-primary hover:underline mt-2"
              >
                <Download className="size-3" />
                Download
              </a>
            )}
          </div>
        )
      })}
    </div>
  )
}
