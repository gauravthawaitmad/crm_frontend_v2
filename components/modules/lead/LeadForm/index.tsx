'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { StageForm } from '@/components/shared/StageForm'
import { StageProgress } from '@/components/shared/StageProgress'
import { NextStageSelector } from '@/components/modules/lead/LeadForm/NextStageSelector'
import { LEAD_FORM_CONFIG } from '@/components/modules/lead/LeadForm/config'
import { getSchemaForStage } from '@/lib/validations/lead'
import { useCreateLead, useUpdateLeadStage } from '@/hooks/useLead'
import type { Lead, LeadDetail, ConversionStage, UpdateLeadStageInput } from '@/types/lead'
import { toast } from 'sonner'

interface LeadFormProps {
  mode: 'create' | 'update'
  lead?: Lead | LeadDetail
  onSuccess?: () => void
  onCancel?: () => void
  /** When set (from kanban drag), skip NextStageSelector and go directly to this stage's fields */
  forcedTargetStage?: ConversionStage
}

export function LeadForm({ mode, lead, onSuccess, onCancel, forcedTargetStage }: LeadFormProps) {
  const [selectedNextStage, setSelectedNextStage] = useState<ConversionStage | null>(
    forcedTargetStage ?? null
  )

  // Current stage for update mode — LeadDetail has currentStage; Lead has latestAgreement
  let currentStage: ConversionStage | undefined
  if (lead) {
    if ('currentStage' in lead) {
      currentStage = lead.currentStage
    } else if ('latestAgreement' in lead) {
      currentStage = lead.latestAgreement?.conversion_stage
    }
  }

  // Active config: create → 'new'; update + stage selected → that stage
  const activeConfig =
    mode === 'create' ? LEAD_FORM_CONFIG.new : selectedNextStage ? LEAD_FORM_CONFIG[selectedNextStage] : null

  const schema =
    mode === 'create'
      ? getSchemaForStage('new')
      : selectedNextStage
        ? getSchemaForStage(selectedNextStage)
        : null

  const form = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: {},
  })

  const createLead = useCreateLead()
  const updateStage = useUpdateLeadStage()
  const isSubmitting = createLead.isPending || updateStage.isPending

  const onSubmit = async (data: Record<string, unknown>) => {
    try {
      if (mode === 'create') {
        await createLead.mutateAsync({
          partner_name: String(data.partner_name ?? ''),
          co_id: String(data.co_id ?? ''),
          state_id: Number(data.state_id),
          city_id: Number(data.city_id),
          address_line_1: String(data.address_line_1 ?? ''),
          address_line_2: data.address_line_2 ? String(data.address_line_2) : undefined,
          pincode: Number(data.pincode),
          lead_source: String(data.lead_source ?? ''),
        })
        toast.success('Lead created successfully')
      } else if (lead && selectedNextStage) {
        // Convert radio boolean strings to actual booleans
        const payload: Record<string, unknown> = { ...data, conversion_stage: selectedNextStage }
        if (payload.low_income_resource !== undefined) {
          payload.low_income_resource = payload.low_income_resource === 'true'
        }
        if (payload.specific_doc_required !== undefined) {
          payload.specific_doc_required = payload.specific_doc_required === 'true'
        }

        if (data.mou_document instanceof File) {
          // MOU upload — send as FormData
          const formData = new FormData()
          for (const [k, v] of Object.entries(payload)) {
            if (v == null) continue
            if (v instanceof File) {
              formData.append(k, v)
            } else if (Array.isArray(v)) {
              v.forEach((item) => formData.append(`${k}[]`, String(item)))
            } else {
              formData.append(k, String(v))
            }
          }
          await updateStage.mutateAsync({ id: lead.id, data: formData as unknown as UpdateLeadStageInput | FormData })
        } else {
          await updateStage.mutateAsync({ id: lead.id, data: payload as unknown as UpdateLeadStageInput })
        }

        toast.success(`Stage updated to "${LEAD_FORM_CONFIG[selectedNextStage].label}"`)
      }

      form.reset()
      setSelectedNextStage(null)
      onSuccess?.()
    } catch {
      toast.error(mode === 'create' ? 'Failed to create lead' : 'Failed to update stage')
    }
  }

  // Update mode: show NextStageSelector until a stage is chosen
  if (mode === 'update' && !selectedNextStage) {
    if (!currentStage) return null
    const availableNext = LEAD_FORM_CONFIG[currentStage]?.nextStages ?? []
    return (
      <div className="space-y-4">
        <NextStageSelector
          currentStage={currentStage}
          availableStages={availableNext}
          onSelect={setSelectedNextStage}
        />
        <Button variant="outline" className="w-full" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    )
  }

  if (!activeConfig) return null

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as Parameters<typeof form.handleSubmit>[0])} className="space-y-5">
        {/* Stage context */}
        <div className="space-y-2">
          {mode === 'update' && selectedNextStage && currentStage && (
            <>
              {/* Hide "Change stage" when stage was forced by kanban drag */}
              {!forcedTargetStage && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNextStage(null)
                    form.reset()
                  }}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Change stage
                </button>
              )}
              <StageProgress currentStage={currentStage} targetStage={selectedNextStage} />
            </>
          )}
          <p className="text-sm text-muted-foreground">{activeConfig.description}</p>
        </div>

        {/* Fields */}
        <StageForm fields={activeConfig.fields} />

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-primary text-white hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {mode === 'create'
              ? 'Create Lead'
              : `Move to ${LEAD_FORM_CONFIG[selectedNextStage!]?.label}`}
          </Button>
        </div>
      </form>
    </Form>
  )
}
