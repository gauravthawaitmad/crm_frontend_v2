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
  Pencil,
  Trash2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LeadForm } from '@/components/modules/lead/LeadForm'
import { PocTabContent } from '@/components/modules/poc/PocTabContent'
import { CommentSection } from '@/components/modules/comments/CommentSection'
import { useLeadDetail, useDeleteLead } from '@/hooks/useLead'
import { useAppSelector } from '@/store/hooks'
import { STAGE_CONFIG, formatDate, getInitials, getAvatarColor } from '@/lib/stages'
import { toast } from 'sonner'
import type { LeadDetail } from '@/types/lead'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function LeadDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'pocs' | 'comments'>('overview')

  const userRole = useAppSelector((s) => s.auth.user?.user_role)
  const canDelete = userRole === 'super_admin' || userRole === 'admin'

  const { data, isLoading, isError } = useLeadDetail(Number(id))
  const deleteLead = useDeleteLead()

  const lead: LeadDetail | undefined = data?.result

  function handleDelete() {
    deleteLead.mutate(Number(id), {
      onSuccess: () => {
        toast.success('Lead deleted')
        router.push('/lead')
      },
      onError: () => toast.error('Failed to delete lead'),
    })
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-6">
          <div className="w-80 shrink-0 space-y-4">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="flex-1 h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError || !lead) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle className="size-10 text-red-400" />
        <p className="text-lg font-medium text-foreground">Lead not found</p>
        <p className="text-sm text-muted-foreground">This lead may have been deleted.</p>
        <Button variant="outline" onClick={() => router.push('/lead')}>
          <ArrowLeft className="size-4" />
          Back to Leads
        </Button>
      </div>
    )
  }

  const stage = lead.currentStage
  const stageConfig = stage ? STAGE_CONFIG[stage] : null
  const co = lead.latestCo?.co
  const coName = co?.user_display_name ?? '—'
  const location = [lead.city?.city_name, lead.state?.state_name].filter(Boolean).join(', ')
  const history = lead.tracking_history ?? []

  // School info is available once stage reaches interested
  const schoolInfoStages = ['interested', 'interested_but_facing_delay', 'not_interested', 'dropped', 'converted']
  const hasSchoolInfo = stage && schoolInfoStages.includes(stage) &&
    (lead.school_type || lead.partner_affiliation_type || lead.total_child_count)

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/lead" className="hover:text-foreground transition-colors">
          Leads
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground font-medium truncate max-w-xs">{lead.partner_name}</span>
      </nav>

      {/* Back + title row */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/lead')} className="gap-1.5">
          <ArrowLeft className="size-4" />
          Leads
        </Button>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 items-start">

        {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
        <div className="w-80 shrink-0 space-y-4">

          {/* Card 1 — Partner Info */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold text-stone-900 leading-tight">
                {lead.partner_name}
              </h1>
              {stageConfig && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${stageConfig.color}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${stageConfig.dot}`} />
                  {stageConfig.label}
                </span>
              )}
            </div>

            <div className="space-y-2.5 text-sm">
              {/* Lead source */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wide text-stone-400">Source</span>
                <span className="text-foreground">{lead.lead_source}</span>
              </div>

              {/* Location */}
              {location && (
                <div className="flex items-start gap-2">
                  <MapPin className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="text-foreground">
                    {location}
                    {lead.pincode && <span className="text-muted-foreground"> · {lead.pincode}</span>}
                    <div className="text-muted-foreground text-xs mt-0.5">
                      {lead.address_line_1}
                      {lead.address_line_2 && <>, {lead.address_line_2}</>}
                    </div>
                  </div>
                </div>
              )}

              {/* Assigned CO */}
              <div className="flex items-center gap-2">
                <User className="size-3.5 text-muted-foreground shrink-0" />
                {co ? (
                  <div className="flex items-center gap-2">
                    <Avatar className={`size-6 ${getAvatarColor(coName)}`}>
                      <AvatarFallback className="text-[10px] font-semibold text-white">
                        {getInitials(coName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="text-foreground text-sm">{coName}</span>
                      {co.user_role && (
                        <span className="text-xs text-muted-foreground ml-1.5">({co.user_role})</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </div>

              {/* Created date */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-3.5 shrink-0" />
                <span>Added {formatDate(lead.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Card 2 — Stage Journey timeline */}
          {history.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-4">Stage Journey</h3>
              <ol className="relative space-y-4">
                {history.map((entry, idx) => {
                  const sc = STAGE_CONFIG[entry.stage]
                  return (
                    <li key={idx} className="flex gap-3">
                      {/* Timeline dot + line */}
                      <div className="flex flex-col items-center">
                        <span className={`size-2.5 rounded-full mt-0.5 shrink-0 ${idx === 0 ? 'bg-orange-500' : sc?.dot ?? 'bg-stone-300'}`} />
                        {idx < history.length - 1 && (
                          <span className="w-px flex-1 bg-border mt-1" />
                        )}
                      </div>
                      {/* Entry content */}
                      <div className="pb-2 min-w-0">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sc?.color ?? 'bg-stone-100 text-stone-600'}`}>
                          {sc?.label ?? entry.stage}
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(entry.date)}
                        </p>
                        {/* Stage details */}
                        {entry.details?.non_conversion_reason && (
                          <p className="text-xs text-muted-foreground mt-0.5 italic">
                            {entry.details.non_conversion_reason}
                          </p>
                        )}
                        {entry.details?.current_status && (
                          <p className="text-xs text-muted-foreground mt-0.5 italic truncate">
                            {entry.details.current_status}
                          </p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          )}

          {/* Card 3 — Quick Actions */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-2.5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Quick Actions</h3>
            <Button
              className="w-full bg-primary text-white hover:bg-primary/90"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="size-4" />
              Update Stage
            </Button>
            {canDelete && (
              <Button
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-4" />
                Delete Lead
              </Button>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Tab bar */}
          <div className="border-b border-border mb-5">
            <nav className="flex gap-0">
              {(['overview', 'pocs', 'comments'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'pocs' ? 'POCs' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {hasSchoolInfo ? (
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-foreground mb-4">School Information</h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    {lead.school_type && (
                      <InfoRow label="School Type" value={lead.school_type} />
                    )}
                    {lead.partner_affiliation_type && (
                      <InfoRow label="Affiliation" value={lead.partner_affiliation_type} />
                    )}
                    {lead.total_child_count != null && (
                      <InfoRow label="Total Students" value={lead.total_child_count.toLocaleString()} />
                    )}
                    {/* potential_child_count from latest agreement */}
                    {lead.agreements?.[0]?.potential_child_count != null && (
                      <InfoRow
                        label="Potential Beneficiaries"
                        value={lead.agreements[0].potential_child_count.toLocaleString()}
                      />
                    )}
                    {lead.classes && lead.classes.length > 0 && (
                      <div className="col-span-2">
                        <span className="text-xs font-medium text-stone-400 uppercase tracking-wide block mb-1">Classes</span>
                        <div className="flex flex-wrap gap-1.5">
                          {lead.classes.map((c) => (
                            <span key={c} className="px-2 py-0.5 rounded bg-stone-100 text-stone-600 text-xs">{c}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {lead.low_income_resource != null && (
                      <InfoRow label="Low-Income Resource" value={lead.low_income_resource ? 'Yes' : 'No'} />
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <p className="text-sm font-medium text-muted-foreground">School information not yet available</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Available after the lead reaches the <strong>Interested</strong> stage
                  </p>
                </div>
              )}

              {/* Latest agreement details */}
              {lead.agreements?.[0] && lead.agreements[0].conversion_stage !== 'new' && (
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Current Stage Details</h3>
                  <div className="space-y-2 text-sm">
                    {lead.agreements[0].non_conversion_reason && (
                      <InfoRow label="Reason" value={lead.agreements[0].non_conversion_reason} />
                    )}
                    {lead.agreements[0].current_status && (
                      <InfoRow label="Current Status" value={lead.agreements[0].current_status} />
                    )}
                    {lead.agreements[0].expected_conversion_day && (
                      <InfoRow
                        label="Expected Resolution"
                        value={`${lead.agreements[0].expected_conversion_day} days`}
                      />
                    )}
                    {lead.agreements[0].specific_doc_required != null && (
                      <InfoRow
                        label="Specific Doc Required"
                        value={lead.agreements[0].specific_doc_required ? 'Yes' : 'No'}
                      />
                    )}
                    {lead.agreements[0].specific_doc_name && (
                      <InfoRow label="Document" value={lead.agreements[0].specific_doc_name} />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* POCs tab */}
          {activeTab === 'pocs' && (
            <PocTabContent partnerId={lead.id} />
          )}

          {/* Comments tab */}
          {activeTab === 'comments' && (
            <CommentSection partnerId={lead.id} />
          )}
        </div>
      </div>

      {/* Update Stage Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Stage — {lead.partner_name}</DialogTitle>
          </DialogHeader>
          <LeadForm
            mode="update"
            lead={lead}
            onSuccess={() => setEditOpen(false)}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{lead.partner_name}</strong> will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleteLead.isPending}
            >
              {deleteLead.isPending && <Loader2 className="size-4 mr-1 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <span className="text-xs font-medium text-stone-400 uppercase tracking-wide block mb-0.5">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  )
}
