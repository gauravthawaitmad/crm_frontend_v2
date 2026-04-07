import type { ConversionStage } from '@/types/lead';
import { LEAD_SOURCES, DROP_REASONS, AFFILIATIONS, SCHOOL_TYPES, CLASSES } from '@/lib/constants';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'select'
  | 'cascading-select'
  | 'multi-select'
  | 'file'
  | 'radio';

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: Array<{ value: string | number; label: string }>;
  /** For cascading-select: which field to watch */
  dependsOn?: string;
  /** Which API to call for dynamic options */
  apiSource?: 'states' | 'cities' | 'co-users';
  required?: boolean;
  hint?: string;
}

export interface StageConfig {
  id: ConversionStage;
  label: string;
  description: string;
  fields: FormField[];
  /** Stages this lead can transition to from here */
  nextStages: ConversionStage[];
}

const BOOL_OPTIONS = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
];

export const LEAD_FORM_CONFIG: Record<ConversionStage, StageConfig> = {
  new: {
    id: 'new',
    label: 'New Lead',
    description: 'Add a new potential partner to your pipeline.',
    fields: [
      { name: 'partner_name', label: 'School / Organization Name', type: 'text', placeholder: 'Enter partner name', required: true },
      { name: 'co_id', label: 'Assigned CO', type: 'select', placeholder: 'Select Community Organizer', required: true, apiSource: 'co-users' },
      { name: 'state_id', label: 'State', type: 'select', placeholder: 'Select state', required: true, apiSource: 'states' },
      { name: 'city_id', label: 'City', type: 'cascading-select', placeholder: 'Select city', required: true, apiSource: 'cities', dependsOn: 'state_id' },
      { name: 'address_line_1', label: 'Address Line 1', type: 'text', placeholder: 'Street, building number', required: true },
      { name: 'address_line_2', label: 'Address Line 2', type: 'text', placeholder: 'Landmark, area (optional)' },
      { name: 'pincode', label: 'Pincode', type: 'text', placeholder: '6-digit pincode', required: true },
      { name: 'lead_source', label: 'Lead Source', type: 'select', placeholder: 'How was this lead found?', required: true, options: [...LEAD_SOURCES] },
    ],
    nextStages: ['first_conversation'],
  },

  first_conversation: {
    id: 'first_conversation',
    label: 'First Conversation',
    description: 'Record details from your first meeting with the partner.',
    fields: [
      { name: 'poc_name', label: 'Contact Name', type: 'text', placeholder: 'Principal / Director name', required: true },
      { name: 'poc_designation', label: 'Designation', type: 'text', placeholder: 'e.g. Principal', required: true },
      { name: 'poc_contact', label: 'Contact Number', type: 'text', placeholder: '10-digit mobile number', required: true },
      { name: 'poc_email', label: 'Email Address', type: 'text', placeholder: 'email@school.com', required: true },
      { name: 'date_of_first_contact', label: 'Date of First Contact', type: 'date', required: true },
      { name: 'partner_affiliation_type', label: 'Affiliation Type', type: 'select', placeholder: 'Select board', options: [...AFFILIATIONS] },
      { name: 'school_type', label: 'School Type', type: 'select', placeholder: 'Select type', options: [...SCHOOL_TYPES] },
      { name: 'total_child_count', label: 'Total Student Count', type: 'number', placeholder: 'Approximate number of students' },
      { name: 'classes', label: 'Classes Available', type: 'multi-select', options: [...CLASSES] },
      { name: 'low_income_resource', label: 'Low-Income Resource School?', type: 'radio', options: BOOL_OPTIONS },
      { name: 'potential_child_count', label: 'Potential Child Count', type: 'number', placeholder: 'Expected beneficiaries' },
    ],
    nextStages: ['interested', 'not_interested', 'dropped'],
  },

  interested: {
    id: 'interested',
    label: 'Interested',
    description: 'Partner has expressed interest — capture additional details.',
    fields: [
      { name: 'specific_doc_required', label: 'Specific Document Required?', type: 'radio', options: BOOL_OPTIONS },
      { name: 'specific_doc_name', label: 'Document Name', type: 'text', placeholder: 'e.g. Trust Certificate', hint: 'Fill only if a specific document is needed' },
      { name: 'potential_child_count', label: 'Potential Child Count', type: 'number', placeholder: 'Updated estimate' },
    ],
    nextStages: ['interested_but_facing_delay', 'not_interested', 'dropped', 'converted'],
  },

  interested_but_facing_delay: {
    id: 'interested_but_facing_delay',
    label: 'Facing Delay',
    description: 'Partner is interested but facing an obstacle to conversion.',
    fields: [
      { name: 'current_status', label: 'Obstacle Description', type: 'textarea', placeholder: 'Describe what is causing the delay...', required: true },
      { name: 'expected_conversion_day', label: 'Expected Resolution (days)', type: 'number', placeholder: 'Approximate days to resolve' },
    ],
    nextStages: ['interested', 'not_interested', 'dropped', 'converted'],
  },

  not_interested: {
    id: 'not_interested',
    label: 'Not Interested',
    description: 'Partner has declined to proceed — record the reason.',
    fields: [
      { name: 'non_conversion_reason', label: 'Reason', type: 'select', placeholder: 'Select reason', required: true, options: [...DROP_REASONS] },
      { name: 'non_conversion_reason_other', label: 'Other Reason', type: 'text', placeholder: 'Specify if "Other" is selected', hint: 'Required when "Other" is selected' },
      { name: 'agreement_drop_date', label: 'Date', type: 'date', required: true },
    ],
    nextStages: ['interested', 'dropped'],
  },

  dropped: {
    id: 'dropped',
    label: 'Dropped',
    description: 'Lead is permanently dropped from the pipeline.',
    fields: [
      { name: 'non_conversion_reason', label: 'Drop Reason', type: 'select', placeholder: 'Select reason', required: true, options: [...DROP_REASONS] },
      { name: 'non_conversion_reason_other', label: 'Other Reason', type: 'text', placeholder: 'Specify if "Other" is selected', hint: 'Required when "Other" is selected' },
      { name: 'agreement_drop_date', label: 'Drop Date', type: 'date', required: true },
    ],
    nextStages: ['interested'],
  },

  converted: {
    id: 'converted',
    label: 'Converted',
    description: 'Partner has signed the MOU — record the agreement details.',
    fields: [
      { name: 'mou_sign_date', label: 'MOU Sign Date', type: 'date', required: true },
      { name: 'mou_start_date', label: 'MOU Start Date', type: 'date', required: true },
      { name: 'mou_end_date', label: 'MOU End Date', type: 'date', required: true },
      { name: 'confirmed_child_count', label: 'Confirmed Child Count', type: 'number', placeholder: 'Number of confirmed beneficiaries', required: true },
      { name: 'mou_document', label: 'MOU Document', type: 'file', hint: 'Upload the signed MOU (PDF)', required: true },
    ],
    nextStages: [],
  },
};
