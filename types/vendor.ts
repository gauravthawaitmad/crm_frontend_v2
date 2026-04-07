export type VendorStage = 'identified' | 'contacted' | 'approved' | 'active' | 'inactive' | 'dropped'

export type VendorType = 'facilitator' | 'speaker' | 'printer' | 'venue_provider' | 'event_service' | 'other'

export interface VendorEngagement {
  id: number
  partner_id: number
  engagement_name: string
  school_partner_id?: number | null
  school_name?: string | null
  engagement_date: string
  service_provided: string
  rating_overall: number
  rating_quality?: number | null
  rating_timeliness?: number | null
  rating_cost?: number | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface VendorPartner {
  id: number
  name: string
  entity_type: 'vendor'
  vendor_type?: VendorType | null
  services_description?: string | null
  average_rating: number
  total_engagements: number
  currentStage: VendorStage
  city?: { id: number; name: string } | null
  state?: { id: number; name: string } | null
  assigned_co?: {
    user_id: string
    user_display_name: string
    user_role: string
  } | null
  createdAt: string
  updatedAt: string
}

export interface VendorDetail extends VendorPartner {
  contract_services?: string | null
  contract_document?: string | null
  stage_history: Array<{
    id: number
    conversion_stage: string
    createdAt: string
    changed_by?: string
    extra_data?: Record<string, unknown>
  }>
  pocs: Array<{
    id: number
    poc_name: string
    poc_designation?: string
    poc_contact?: string
    poc_email?: string
  }>
  engagements: VendorEngagement[]
  tagged_schools: Array<{
    id: number
    school_partner_id: number
    school_name: string
    city?: string
    state?: string
    status?: string
  }>
}

export interface CreateVendorInput {
  name: string
  vendor_type: VendorType
  state_id: number
  city_id: number
  co_id: string
  services_description?: string
}

export interface UpdateVendorDetailsInput {
  name?: string
  vendor_type?: VendorType
  state_id?: number
  city_id?: number
  services_description?: string
  contract_services?: string
}

export interface UpdateVendorStageInput {
  stage: VendorStage
  notes?: string
  drop_reason?: string
}

export interface AddEngagementInput {
  engagement_name: string
  engagement_date: string
  service_provided: string
  rating_overall: number
  rating_quality?: number | null
  rating_timeliness?: number | null
  rating_cost?: number | null
  school_partner_id?: number | null
  notes?: string
}

export interface UpdateEngagementInput extends Partial<AddEngagementInput> {}

export interface VendorListParams {
  page?: number
  limit?: number
  search?: string
  stage?: string
  vendor_type?: string
  sort_by?: 'rating' | 'name' | 'recent'
}
