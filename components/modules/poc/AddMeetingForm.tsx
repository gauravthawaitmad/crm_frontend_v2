'use client'

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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CalendarDays } from 'lucide-react'
import type { Poc } from '@/types/poc'
import { useAddMeeting } from '@/hooks/usePoc'
import { toast } from 'sonner'

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z
  .object({
    meeting_date: z.string().min(1, 'Meeting date is required'),
    meeting_notes: z.string().max(2000).optional(),
    follow_up_meeting_scheduled: z.boolean().optional(),
    follow_up_meeting_date: z.string().optional(),
  })
  .refine(
    (d) =>
      !d.follow_up_meeting_scheduled ||
      (d.follow_up_meeting_date && d.follow_up_meeting_date.length > 0),
    {
      message: 'Follow-up date is required when follow-up is scheduled',
      path: ['follow_up_meeting_date'],
    }
  )

type FormValues = z.infer<typeof schema>

// ── Props ─────────────────────────────────────────────────────────────────────

interface AddMeetingFormProps {
  poc: Poc | null
  partnerId: number
  isOpen: boolean
  onClose: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AddMeetingForm({ poc, partnerId, isOpen, onClose }: AddMeetingFormProps) {
  const addMeeting = useAddMeeting(partnerId)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      meeting_date: todayISO(),
      meeting_notes: '',
      follow_up_meeting_scheduled: false,
      follow_up_meeting_date: '',
    },
  })

  const followUpScheduled = form.watch('follow_up_meeting_scheduled')

  function handleClose() {
    form.reset()
    onClose()
  }

  function onSubmit(values: FormValues) {
    if (!poc) return

    addMeeting.mutate(
      {
        pocId: poc.id,
        data: {
          meeting_date: values.meeting_date,
          meeting_notes: values.meeting_notes || undefined,
          follow_up_meeting_scheduled: values.follow_up_meeting_scheduled,
          follow_up_meeting_date:
            values.follow_up_meeting_scheduled && values.follow_up_meeting_date
              ? values.follow_up_meeting_date
              : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success('Meeting recorded successfully')
          handleClose()
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Failed to record meeting'
          toast.error(msg)
        },
      }
    )
  }

  if (!poc) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="size-5 text-primary" />
            Add Meeting — {poc.poc_name}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Meeting Date */}
            <FormField
              control={form.control}
              name="meeting_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Meeting Notes */}
            <FormField
              control={form.control}
              name="meeting_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What was discussed?"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Follow-up checkbox */}
            <FormField
              control={form.control}
              name="follow_up_meeting_scheduled"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        id="follow-up-check"
                        className="size-4 rounded border-border accent-primary cursor-pointer"
                        checked={field.value === true}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    </FormControl>
                    <label
                      htmlFor="follow-up-check"
                      className="text-sm text-foreground cursor-pointer"
                    >
                      Schedule follow-up meeting
                    </label>
                  </div>
                </FormItem>
              )}
            />

            {/* Follow-up date (conditional) */}
            {followUpScheduled && (
              <FormField
                control={form.control}
                name="follow_up_meeting_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow-up Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary-dark text-white"
                disabled={addMeeting.isPending}
              >
                {addMeeting.isPending ? 'Saving…' : 'Save Meeting'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
