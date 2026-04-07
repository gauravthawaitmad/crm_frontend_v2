/**
 * usePartner hooks — scaffold stubs for Phase D
 * These will be wired to real API endpoints in Phase D when type-specific modules are built.
 */

import type { EntityType } from '@/lib/partner-configs/types'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PartnerListParams {
  page?: number
  limit?: number
  search?: string
  stage?: string
}

export interface StageUpdateInput {
  stage: string
  notes?: string
  drop_reason?: string
}

export interface ReactivateInput {
  notes?: string
}

export interface ReallocateInput {
  new_co_id: string
  notes?: string
}

// ── Scaffold return shape ──────────────────────────────────────────────────────

interface ScaffoldQuery<T> {
  data: T | null
  isLoading: false
  isError: false
}

interface ScaffoldMutation<TInput> {
  mutate: (input: TInput) => void
  mutateAsync: (input: TInput) => Promise<void>
  isPending: false
}

function makeQuery<T>(): ScaffoldQuery<T> {
  return { data: null, isLoading: false, isError: false }
}

function makeMutation<TInput>(): ScaffoldMutation<TInput> {
  return {
    mutate: (_input: TInput) => {
      console.warn('usePartner mutation not yet wired — Phase D will implement this')
    },
    mutateAsync: async (_input: TInput) => {
      console.warn('usePartner mutateAsync not yet wired — Phase D will implement this')
    },
    isPending: false,
  }
}

// ── Scaffold hooks ─────────────────────────────────────────────────────────────

export function usePartnerList(_entityType: EntityType, _params: PartnerListParams = {}) {
  return makeQuery<{ result: unknown[]; pagination: { total: number; page: number; totalPages: number } }>()
}

export function usePartnerDetail(_id: number | null) {
  return makeQuery<{ result: Record<string, unknown> }>()
}

export function useCreatePartner(_entityType: EntityType) {
  return makeMutation<Record<string, unknown>>()
}

export function useUpdatePartnerStage(_id: number, _entityType: EntityType) {
  return makeMutation<StageUpdateInput>()
}

export function useReactivatePartner(_id: number, _entityType?: EntityType) {
  return makeMutation<ReactivateInput>()
}

export function useReallocatePartnerCo(_id: number, _entityType?: EntityType) {
  return makeMutation<ReallocateInput>()
}
