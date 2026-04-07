export type SourcingStage =
  | 'identified' | 'first_contact' | 'in_discussion'
  | 'onboarded' | 'paused' | 'dropped'

export interface SourcingDetail {
  id: number
  partner_id: number
  organization_type: string | null
  volunteers_committed: number
  volunteers_deployed: number
  org_type?: string | null
  website?: string | null
  volunteer_capacity?: number | null
  notes?: string | null
}

export interface PartnerCommitment {
  id: number
  partner_id: number
  entity_type: string
  cycle_label: string | null
  cycle_year?: number | null
  committed_count: number | null
  delivered_count: number
  actual_count?: number | null
  start_date: string | null
  end_date: string | null
  commitment_notes: string | null
  status: 'active' | 'completed' | 'cancelled' | 'pending'
  document_url: string | null
  createdAt: string
}

export interface TaggedSchool {
  id: number
  partner_id: number
  school_partner_id: number
  school_name: string
  city: string | null
  state: string | null
  status: string | null
  tagged_by: string | null
}

export interface StageHistoryEntry {
  id: number
  stage: string
  changed_by: string | null
  changed_at: string
  notes: string | null
}

export interface AssignedCo {
  co_id: number
  co: {
    user_id: number
    user_display_name: string
    user_login: string
    user_role: string
  }
}

export interface SourcingPartner {
  id: number
  partner_name: string
  entity_type: 'sourcing'
  currentStage: SourcingStage
  sourcingDetail: SourcingDetail | null
  latestAgreement: { conversion_stage: string } | null
  latestCo: AssignedCo | null
  latestPoc: { poc_id: number; poc_name: string; poc_contact: string } | null
  state: { id: number; state_name: string } | null
  city: { id: number; city_name: string } | null
  lead_source: string | null
  address_line_1: string | null
  createdAt: string
  updatedAt: string
}

export interface SourcingPartnerFull extends SourcingPartner {
  agreements: Array<{ id: number; conversion_stage: string; createdAt: string; changed_by: string | null }>
  stage_history: StageHistoryEntry[]
  commitments: PartnerCommitment[]
  tagged_schools: TaggedSchool[]
}

export interface CreateSourcingInput {
  name: string
  organization_type: string
  state_id: number
  city_id: number
  co_id: string | number
  address_line_1?: string
  pincode?: number
  lead_source?: string
}

export interface UpdateSourcingDetailsInput {
  name?: string
  organization_type?: string
  state_id?: number
  city_id?: number
  volunteers_committed?: number
  volunteers_deployed?: number
  website?: string
  notes?: string
}

export interface UpdateSourcingStageInput {
  stage: SourcingStage
  notes?: string
  drop_reason?: string
}

export interface AddCommitmentInput {
  cycle_label: string
  committed_count: number
  delivered_count?: number
  start_date: string
  end_date: string
  commitment_notes?: string
  status?: 'active' | 'completed' | 'cancelled'
}

// Legacy types kept for backward compat
export interface Commitment {
  id: number
  partner_id: number
  cycle_year: number
  committed_count: number | null
  actual_count: number | null
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  commitment_notes: string | null
  createdAt: string
}

export interface SchoolTag {
  id: number
  partner_id: number
  school_partner_id: number
  school_name: string
  notes: string | null
  tagged_by: string | null
}

export interface AddSchoolTagInput {
  school_partner_id: number
  notes?: string
}

export interface UpdateCommitmentInput {
  cycle_label?: string
  committed_count?: number
  delivered_count?: number
  start_date?: string
  end_date?: string
  commitment_notes?: string | null
  status?: 'active' | 'completed' | 'cancelled'
}
