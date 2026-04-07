// Phase 4 — Zod schemas for Organization forms
import { z } from 'zod';

export const renewMouSchema = z.object({
  mou_sign_date: z.string().min(1, 'Sign date is required'),
  mou_start_date: z.string().min(1, 'Start date is required'),
  mou_end_date: z.string().min(1, 'End date is required'),
  confirmed_child_count: z.coerce.number().min(1, 'Child count is required'),
  mou_document: z.any().refine((f) => f instanceof File, 'MOU document is required'),
}).refine(
  (data) => new Date(data.mou_end_date) > new Date(data.mou_start_date),
  { message: 'End date must be after start date', path: ['mou_end_date'] }
);

export const reallocateSchema = z.object({
  partner_id: z.number().positive(),
  current_co_user_login: z.string().min(1, 'Current CO is required'),
  new_co_user_login: z.string().min(1, 'New CO is required'),
  meeting_date: z.string().optional(),
}).refine(
  (data) => data.current_co_user_login !== data.new_co_user_login,
  { message: 'New CO must be different from current CO', path: ['new_co_user_login'] }
);
