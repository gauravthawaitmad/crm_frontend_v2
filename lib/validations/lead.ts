// Phase 3 — Zod schemas for each lead stage
// These mirror the Joi validators in crm_v2_backend/src/validators/lead.validator.js
import { z } from 'zod';
import type { ConversionStage } from '@/types/lead';

export const leadNewSchema = z.object({
  partner_name: z.string().min(1, 'Partner name is required'),
  co_id: z.string().min(1, 'Assigned CO is required'),
  state_id: z.coerce.number().positive('State is required'),
  city_id: z.coerce.number().positive('City is required'),
  address_line_1: z.string().min(1, 'Address is required'),
  address_line_2: z.string().optional(),
  pincode: z.string().length(6, 'Pincode must be 6 digits').regex(/^\d+$/, 'Pincode must be numeric'),
  lead_source: z.string().min(1, 'Lead source is required'),
});

export const leadFirstConversationSchema = z.object({
  poc_name: z.string().min(1, 'Contact name is required'),
  poc_designation: z.string().min(1, 'Designation is required'),
  poc_contact: z.string().regex(/^[6-9]\d{9}$/, 'Must be 10 digits starting with 6-9'),
  poc_email: z.string().email('Invalid email address'),
  date_of_first_contact: z.string().min(1, 'Date is required'),
  partner_affiliation_type: z.string().optional(),
  school_type: z.string().optional(),
  total_child_count: z.coerce.number().min(0).optional(),
  classes: z.array(z.string()).optional(),
  low_income_resource: z.string().optional(), // 'true' | 'false' — converted in submit handler
  potential_child_count: z.coerce.number().min(0).optional(),
});

export const leadInterestedSchema = z.object({
  specific_doc_required: z.string().optional(), // 'true' | 'false'
  specific_doc_name: z.string().optional(),
  potential_child_count: z.coerce.number().min(0).optional(),
});

export const leadDelayedSchema = z.object({
  current_status: z.string().min(1, 'Please describe the obstacle'),
  expected_conversion_day: z.coerce.number().min(0).optional(),
});

export const leadNotInterestedSchema = z.object({
  non_conversion_reason: z.string().min(1, 'Reason is required'),
  non_conversion_reason_other: z.string().optional(),
  agreement_drop_date: z.string().min(1, 'Date is required'),
});

export const leadConvertedSchema = z.object({
  mou_sign_date: z.string().min(1, 'MOU sign date is required'),
  mou_start_date: z.string().min(1, 'MOU start date is required'),
  mou_end_date: z.string().min(1, 'MOU end date is required'),
  confirmed_child_count: z.coerce.number().min(1, 'Confirmed count is required'),
  mou_document: z.any().refine((f) => f instanceof File, 'MOU document is required'),
});

export const leadDroppedSchema = z.object({
  non_conversion_reason: z.string().min(1, 'Drop reason is required'),
  non_conversion_reason_other: z.string().optional(),
  agreement_drop_date: z.string().min(1, 'Date is required'),
});

export const stageSchemas: Partial<Record<ConversionStage, z.ZodObject<z.ZodRawShape>>> = {
  new: leadNewSchema,
  first_conversation: leadFirstConversationSchema,
  interested: leadInterestedSchema,
  interested_but_facing_delay: leadDelayedSchema,
  not_interested: leadNotInterestedSchema,
  converted: leadConvertedSchema,
  dropped: leadDroppedSchema,
};

export function getSchemaForStage(stage: ConversionStage) {
  return stageSchemas[stage] ?? z.object({});
}
