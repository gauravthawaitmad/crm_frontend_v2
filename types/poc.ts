// POC and Meeting types — matches API response from /api/pocs

export interface Meeting {
  id: number
  user_id: string | number
  poc_id: number
  partner_id: number
  meeting_date: string
  meeting_notes: string | null
  follow_up_meeting_scheduled: boolean
  follow_up_meeting_date: string | null
  createdAt: string
  updatedAt: string
}

export interface Poc {
  id: number
  partner_id: number
  poc_name: string
  poc_designation: string | null
  poc_contact: string
  poc_email: string | null
  date_of_first_contact: string | null
  removed: boolean
  createdAt: string
  updatedAt: string
  meetings?: Meeting[]
}

// POC with partner name — returned by GET /api/pocs/all
export interface PocWithPartner extends Poc {
  partner_name: string
}

// Duplicate detection response from POST /api/pocs (409)
export interface DuplicatePocError {
  success: false
  message: string
  duplicate: Poc
}

export interface CreatePocInput {
  partner_id: number
  poc_name: string
  poc_designation?: string
  poc_contact: string
  poc_email?: string
  date_of_first_contact?: string
}

export interface UpdatePocInput {
  poc_name?: string
  poc_designation?: string
  poc_contact?: string
  poc_email?: string
  date_of_first_contact?: string
}

export interface AddMeetingInput {
  meeting_date: string
  meeting_notes?: string
  follow_up_meeting_scheduled?: boolean
  follow_up_meeting_date?: string
}
