'use client'

import { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'
import type { Organization } from '@/types/organization'
import { useReallocateCo } from '@/hooks/useOrganization'
import { useCOUsers } from '@/hooks/useReference'
import { toast } from 'sonner'

// ── Validation schema ─────────────────────────────────────────────────────────

const schema = z.object({
  new_co_id: z.string().min(1, 'Please select a CO'),
  confirmed: z.boolean().refine((v) => v === true, {
    message: 'Please confirm the reallocation',
  }),
})

type FormValues = z.infer<typeof schema>

// ── Props ─────────────────────────────────────────────────────────────────────

interface ReallocateFormProps {
  org: Organization | null
  isOpen: boolean
  onClose: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ReallocateForm({ org, isOpen, onClose }: ReallocateFormProps) {
  const reallocate = useReallocateCo()
  const { data: coUsers = [], isLoading: coLoading } = useCOUsers()

  const currentCoId = org?.latestCo?.co_id?.toString()
  const currentCoName = org?.latestCo?.co?.user_display_name ?? '—'

  // Filter out current CO from the dropdown
  const availableCos = coUsers.filter(
    (u) => u.user_id.toString() !== currentCoId
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { new_co_id: '', confirmed: false },
  })

  function handleClose() {
    form.reset()
    onClose()
  }

  function onSubmit(values: FormValues) {
    if (!org) return

    reallocate.mutate(
      { partner_id: org.id, new_co_id: values.new_co_id },
      {
        onSuccess: () => {
          toast.success('Partner reallocated successfully')
          handleClose()
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ?? 'Failed to reallocate partner'
          toast.error(msg)
        },
      }
    )
  }

  if (!org) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            Reallocate CO — {org.partner_name}
          </DialogTitle>
        </DialogHeader>

        {/* Current CO (read-only) */}
        <div className="rounded-md bg-muted/50 border border-border px-3 py-2 text-sm">
          <span className="text-muted-foreground">Current CO: </span>
          <span className="font-medium text-foreground">{currentCoName}</span>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* New CO selector */}
            <FormField
              control={form.control}
              name="new_co_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New CO</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={coLoading ? 'Loading COs…' : 'Select new CO'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableCos.map((u) => (
                        <SelectItem key={u.user_id} value={u.user_id.toString()}>
                          {u.user_display_name}
                          <span className="ml-1 text-muted-foreground text-xs">({u.user_role})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirmation checkbox */}
            <FormField
              control={form.control}
              name="confirmed"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-start gap-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        id="confirm-reallocate"
                        className="mt-0.5 size-4 rounded border-border accent-primary cursor-pointer"
                        checked={field.value === true}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    </FormControl>
                    <label
                      htmlFor="confirm-reallocate"
                      className="text-sm text-foreground cursor-pointer leading-tight"
                    >
                      I confirm I want to reassign{' '}
                      <span className="font-medium">{org.partner_name}</span> to a new CO
                    </label>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary-dark text-white"
                disabled={reallocate.isPending}
              >
                {reallocate.isPending ? 'Reallocating…' : 'Reallocate'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
