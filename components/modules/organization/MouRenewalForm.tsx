'use client'

import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FileText, Upload, ExternalLink } from 'lucide-react'
import type { Organization } from '@/types/organization'
import { useRenewMou } from '@/hooks/useOrganization'
import { toast } from 'sonner'

// ── Validation schema ─────────────────────────────────────────────────────────

const schema = z
  .object({
    mou_sign_date: z.string().min(1, 'MOU sign date is required'),
    mou_start_date: z.string().min(1, 'MOU start date is required'),
    mou_end_date: z.string().min(1, 'MOU end date is required'),
    confirmed_child_count: z
      .number({ message: 'Child count is required' })
      .int()
      .min(1, 'Child count must be at least 1'),
  })
  .refine((d) => new Date(d.mou_end_date) > new Date(d.mou_start_date), {
    message: 'MOU end date must be after start date',
    path: ['mou_end_date'],
  })

type FormValues = z.infer<typeof schema>

// ── Props ─────────────────────────────────────────────────────────────────────

interface MouRenewalFormProps {
  org: Organization | null
  isOpen: boolean
  onClose: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MouRenewalForm({ org, isOpen, onClose }: MouRenewalFormProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const renewMou = useRenewMou()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      mou_sign_date: '',
      mou_start_date: '',
      mou_end_date: '',
      confirmed_child_count: undefined,
    },
  })

  const selectedFileName = fileRef.current?.files?.[0]?.name

  function handleClose() {
    form.reset()
    if (fileRef.current) fileRef.current.value = ''
    onClose()
  }

  async function onSubmit(values: FormValues) {
    if (!org) return
    const file = fileRef.current?.files?.[0]
    if (!file) {
      form.setError('root', { message: 'MOU document (PDF) is required' })
      return
    }

    const fd = new FormData()
    fd.append('mou_sign_date', values.mou_sign_date)
    fd.append('mou_start_date', values.mou_start_date)
    fd.append('mou_end_date', values.mou_end_date)
    fd.append('confirmed_child_count', String(values.confirmed_child_count))
    fd.append('mou_document', file)

    renewMou.mutate(
      { id: org.id, formData: fd },
      {
        onSuccess: () => {
          toast.success('MOU renewed successfully')
          handleClose()
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ?? 'Failed to renew MOU'
          toast.error(msg)
        },
      }
    )
  }

  if (!org) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            Renew MOU — {org.partner_name}
          </DialogTitle>
        </DialogHeader>

        {/* Current MOU reference */}
        {org.activeMou?.mou_url && (
          <div className="rounded-md bg-muted/50 border border-border px-3 py-2 text-sm flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Current MOU:</span>
            <a
              href={org.activeMou.mou_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1 truncate"
              onClick={(e) => e.stopPropagation()}
            >
              View document <ExternalLink className="size-3 shrink-0" />
            </a>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* MOU Sign Date */}
            <FormField
              control={form.control}
              name="mou_sign_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MOU Sign Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* MOU Start Date */}
            <FormField
              control={form.control}
              name="mou_start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MOU Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* MOU End Date */}
            <FormField
              control={form.control}
              name="mou_end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MOU End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirmed Child Count */}
            <FormField
              control={form.control}
              name="confirmed_child_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmed Child Count</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Enter confirmed child count"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* MOU Document Upload */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium leading-none">
                MOU Document (PDF, max 15 MB) <span className="text-destructive">*</span>
              </label>
              <div
                className="flex items-center gap-2 rounded-md border border-border px-3 py-2 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="size-4 text-muted-foreground shrink-0" />
                <span className={selectedFileName ? 'text-sm text-foreground' : 'text-sm text-muted-foreground'}>
                  {selectedFileName ?? 'Click to upload PDF'}
                </span>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={() => form.clearErrors('root')}
              />
              {form.formState.errors.root && (
                <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary-dark text-white"
                disabled={renewMou.isPending}
              >
                {renewMou.isPending ? 'Renewing…' : 'Renew MOU'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
