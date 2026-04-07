// Static options used in form configs and dropdowns
// These mirror the valid values stored in the database

export const LEAD_SOURCES = [
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'referral', label: 'Referral' },
  { value: 'field_visit', label: 'Field Visit' },
  { value: 'event', label: 'Event' },
  { value: 'online', label: 'Online' },
  { value: 'other', label: 'Other' },
] as const;

export const DROP_REASONS = [
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'no_response', label: 'No Response' },
  { value: 'budget_constraints', label: 'Budget Constraints' },
  { value: 'management_change', label: 'Management Change' },
  { value: 'capacity_issues', label: 'Capacity Issues' },
  { value: 'Other', label: 'Other' },
] as const;

export const AFFILIATIONS = [
  { value: 'CBSE', label: 'CBSE' },
  { value: 'ICSE', label: 'ICSE' },
  { value: 'State Board', label: 'State Board' },
  { value: 'IB', label: 'IB' },
  { value: 'IGCSE', label: 'IGCSE' },
  { value: 'Other', label: 'Other' },
] as const;

export const SCHOOL_TYPES = [
  { value: 'private', label: 'Private' },
  { value: 'government', label: 'Government' },
  { value: 'aided', label: 'Government Aided' },
  { value: 'international', label: 'International' },
] as const;

export const CLASSES = [
  '1st', '2nd', '3rd', '4th', '5th',
  '6th', '7th', '8th', '9th', '10th',
  '11th', '12th',
].map(c => ({ value: c, label: `Class ${c}` }));

export const CONVERSION_STAGES = {
  NEW: 'new',
  PROSPECTING: 'prospecting',
  INTERESTED: 'interested',
  DELAYED: 'interested_but_facing_delay',
  NOT_INTERESTED: 'not_interested',
  CONVERTED: 'converted',
  DROPPED: 'dropped',
} as const;

export const STAGE_LABELS: Record<string, string> = {
  new: 'New Lead',
  prospecting: 'First Conversation',
  interested: 'Interested',
  interested_but_facing_delay: 'Facing Delay',
  not_interested: 'Not Interested',
  converted: 'Converted',
  dropped: 'Dropped',
};

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  CO_FULL_TIME: 'CO Full Time',
  CO_PART_TIME: 'CO Part Time',
  CHO_CO_PART_TIME: 'CHO,CO Part Time',
  CO: 'co',
} as const;

export const PAGINATION_DEFAULT = {
  page: 1,
  pageSize: 20,
} as const;
