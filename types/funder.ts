export type FunderType = 'corporate' | 'individual' | 'grant' | 'group'

export type FunderStage =
  | 'prospect'
  | 'in_discussion'
  | 'agreed'
  | 'active'
  | 'completed'
  | 'dropped'

export type CommitmentType =
  | 'one_time'
  | 'monthly'
  | 'quarterly'
  | 'annual'
  | 'program_based'

export type CommitmentStatus = 'pending' | 'active' | 'completed' | 'cancelled'

export type DeliverableType =
  | 'impact_report'
  | 'outcome_data'
  | 'site_visit'
  | 'branding'
  | 'other'

export type DeliverableStatus = 'pending' | 'submitted' | 'accepted' | 'overdue'

export interface FunderDeliverable {
  id: number
  partner_id: number
  commitment_id: number
  deliverable_type: DeliverableType
  description: string
  due_date: string
  delivered_date?: string
  status: DeliverableStatus
  document_url?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface FunderCommitment {
  id: number
  partner_id: number
  entity_type: 'funder'
  cycle_label: string
  commitment_type: CommitmentType
  amount_description: string
  amount?: number
  amount_per_installment?: number
  installment_frequency?: string
  total_installments?: number
  received_installments: number
  program_name?: string
  start_date: string
  end_date: string
  commitment_notes?: string
  status: CommitmentStatus
  proposal_document?: string
  renewal_flag: boolean
  deliverables?: FunderDeliverable[]
  createdAt: string
  updatedAt: string
}

export interface TaggedSchool {
  id: number
  partner_id: number
  school_partner_id: number
  school_name: string
  city?: string
  state?: string
  status?: string
}

export interface StageHistoryEntry {
  id: number
  partner_id: number
  conversion_stage: FunderStage
  changed_by?: string
  extra_data?: Record<string, unknown>
  createdAt: string
}

export interface AssignedCo {
  user_id: string | number
  user_display_name: string
  user_role: string
}

export interface FunderPartner {
  id: number
  name: string
  entity_type: 'funder'
  funder_type?: FunderType
  website?: string
  notes?: string
  currentStage: FunderStage
  city?: { id: number; name: string }
  state?: { id: number; name: string }
  assigned_co?: AssignedCo
  active_commitment?: FunderCommitment
  createdAt: string
  updatedAt: string
}

export interface FunderDetail extends FunderPartner {
  stage_history: StageHistoryEntry[]
  pocs: Poc[]
  commitments: FunderCommitment[]
  tagged_schools: TaggedSchool[]
}

// Re-use Poc from existing types (minimal shape)
export interface Poc {
  id: number
  poc_name: string
  poc_designation?: string
  poc_contact?: string
  poc_email?: string
}

// ── Input types ───────────────────────────────────────────────────────────────

export interface CreateFunderInput {
  name: string
  funder_type: FunderType
  state_id: number
  city_id: number
  co_id: string | number
  website?: string
}

export interface UpdateFunderDetailsInput {
  name?: string
  funder_type?: FunderType
  state_id?: number
  city_id?: number
  website?: string
  notes?: string
}

export interface UpdateFunderStageInput {
  stage: FunderStage
  notes?: string
  drop_reason?: string
}

export interface AddCommitmentInput {
  cycle_label: string
  commitment_type: CommitmentType
  amount_description: string
  amount?: number
  amount_per_installment?: number
  installment_frequency?: string
  total_installments?: number
  program_name?: string
  start_date: string
  end_date: string
  commitment_notes?: string
  status?: CommitmentStatus
}

export interface UpdateCommitmentInput {
  cycle_label?: string
  commitment_type?: CommitmentType
  amount_description?: string
  amount?: number
  amount_per_installment?: number
  installment_frequency?: string
  total_installments?: number
  received_installments?: number
  program_name?: string
  start_date?: string
  end_date?: string
  commitment_notes?: string
  status?: CommitmentStatus
  document_url?: string
}

export interface AddDeliverableInput {
  commitment_id: number
  deliverable_type: DeliverableType
  description: string
  due_date: string
  notes?: string
}

export interface UpdateDeliverableInput {
  deliverable_type?: DeliverableType
  description?: string
  due_date?: string
  delivered_date?: string
  status?: DeliverableStatus
  notes?: string
  document_url?: string
}

export interface FunderListParams {
  page?: number
  limit?: number
  search?: string
  stage?: FunderStage
}
