// Lead module types — matches actual API response from /api/leads

export type ConversionStage =
  | 'new'
  | 'first_conversation'
  | 'interested'
  | 'interested_but_facing_delay'
  | 'not_interested'
  | 'converted'
  | 'dropped'

export interface PartnerAgreement {
  id: number
  partner_id: number
  conversion_stage: ConversionStage
  current_status?: string
  expected_conversion_day?: number
  non_conversion_reason?: string
  agreement_drop_date?: string
  specific_doc_required?: boolean
  specific_doc_name?: string
  potential_child_count?: number
  removed: boolean
  createdAt: string
  updatedAt?: string
}

export interface AssignedCo {
  co_id: string
  assigned_at?: string
  co: {
    user_id: string
    user_display_name: string
    user_login: string
    user_role: string
    email?: string
  }
}

export interface LatestPoc {
  partner_id?: number
  poc_id?: number
  id?: number
  poc_name: string
  poc_designation?: string
  poc_contact: string
  poc_email?: string
  date_of_first_contact?: string
}

/** Shape returned by GET /api/leads (list item, batch-enriched) */
export interface Lead {
  id: number
  partner_name: string
  address_line_1: string
  address_line_2?: string
  pincode: number
  lead_source: string
  partner_affiliation_type?: string
  school_type?: string
  total_child_count?: number
  classes?: string[]
  low_income_resource?: boolean
  created_by: string
  state_id: number
  city_id: number
  removed: boolean
  createdAt: string
  updatedAt: string
  // Joined via Sequelize includes
  state?: { id: number; state_name: string }
  city?: { id: number; city_name: string }
  // Batch-enriched from raw SQL helpers
  latestAgreement?: PartnerAgreement | null
  latestCo?: AssignedCo | null
  latestPoc?: LatestPoc | null
}

/** Alias for backward compatibility with organization.ts */
export type Poc = LatestPoc

/** Shape returned by GET /api/leads/:id (full detail) */
export interface LeadDetail extends Omit<Lead, 'latestAgreement' | 'latestCo' | 'latestPoc'> {
  currentStage?: ConversionStage
  tracking_history?: Array<{
    stage: ConversionStage
    date: string
    details: {
      non_conversion_reason?: string
      current_status?: string
      expected_conversion_day?: number
      agreement_drop_date?: string
      specific_doc_required?: boolean
      specific_doc_name?: string
      potential_child_count?: number
    }
  }>
  latestCo?: AssignedCo | null
  latestPoc?: LatestPoc | null
  agreements?: PartnerAgreement[]
}

/** Input for POST /api/leads */
export interface CreateLeadInput {
  partner_name: string
  co_id: string
  state_id: number
  city_id: number
  address_line_1: string
  address_line_2?: string
  pincode: number
  lead_source: string
}

/** Input for PATCH /api/leads/:id */
export interface UpdateLeadStageInput {
  conversion_stage: ConversionStage
  // first_conversation / interested
  poc_name?: string
  poc_designation?: string
  poc_contact?: number
  poc_email?: string
  date_of_first_contact?: string
  // interested
  specific_doc_required?: boolean
  specific_doc_name?: string
  partner_affiliation_type?: string
  school_type?: string
  total_child_count?: number
  classes?: string[]
  low_income_resource?: boolean
  potential_child_count?: number
  // interested_but_facing_delay
  current_status?: string
  expected_conversion_day?: number
  // not_interested / dropped
  non_conversion_reason?: string
  agreement_drop_date?: string
  // converted
  mou_sign_date?: string
  mou_start_date?: string
  mou_end_date?: string
  confirmed_child_count?: number
}

/** API pagination wrapper */
export interface PaginatedLeads {
  result: Lead[]
  pagination: {
    total: number
    page: number
    totalPages: number
    limit: number
  }
}
