// Organization module types — matches actual API response from /api/organizations
// An Organization is a Partner where latest PartnerAgreement.conversion_stage = 'converted'

import type { AssignedCo } from './lead'

export interface ActiveMou {
  id: number
  partner_id: number
  mou_sign_date: string | null
  mou_start_date: string | null
  mou_end_date: string | null
  confirmed_child_count: number | null
  mou_url: string | null
  mou_status: 'active' | 'inactive'
  mou_sign: boolean
  pending_mou_reason: string | null
  removed: boolean
  createdAt: string
  updatedAt: string
}

export type MouHistoryItem = ActiveMou

// Re-export for shared use
export type { AssignedCo }

/** Shape returned by GET /api/organizations (list item, batch-enriched) */
export interface Organization {
  id: number
  partner_name: string
  address_line_1: string
  address_line_2?: string
  pincode: number
  lead_source: string
  partner_affiliation_type?: string
  school_type?: string
  total_child_count?: number
  created_by: string
  removed: boolean
  createdAt: string
  updatedAt: string
  // Joined
  state?: { id: number; state_name: string }
  city?: { id: number; city_name: string }
  // Batch-enriched
  activeMou?: ActiveMou | null
  latestCo?: AssignedCo | null
}

/** Shape returned by GET /api/organizations/:id (full detail) */
export interface OrganizationDetail extends Organization {
  agreements?: Array<{
    id: number
    partner_id: number
    conversion_stage: string
    current_status?: string
    createdAt: string
  }>
  partnerCos?: Array<{
    id: number
    co_id: string
    createdAt: string
    co: {
      user_id: string
      user_display_name: string
      user_login: string
      user_role: string
      email?: string
    }
  }>
  mouHistory?: MouHistoryItem[]
}

/** Input for POST /api/organizations/:id/renew-mou (form values) */
export interface RenewMouFormValues {
  mou_sign_date: string
  mou_start_date: string
  mou_end_date: string
  confirmed_child_count: number
  mou_document: FileList
}

/** Input for POST /api/organizations/reallocate */
export interface ReallocateInput {
  partner_id: number
  new_co_id: string
}

/** API pagination wrapper */
export interface PaginatedOrganizations {
  result: Organization[]
  pagination: {
    total: number
    page: number
    totalPages: number
    limit: number
  }
}
