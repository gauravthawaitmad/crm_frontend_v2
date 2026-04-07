'use client'

import { useEffect } from 'react'
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
import { User } from 'lucide-react'
import type { Poc, CreatePocInput, UpdatePocInput } from '@/types/poc'
import { useCreatePoc, useUpdatePoc } from '@/hooks/usePoc'
import { toast } from 'sonner'

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  poc_name: z.string().min(1, 'Name is required').max(200),
  poc_designation: z.string().max(200).optional(),
  poc_contact: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Must be a 10-digit number starting with 6–9'),
  poc_email: z.string().email('Invalid email').optional().or(z.literal('')),
  date_of_first_contact: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

// ── Props ─────────────────────────────────────────────────────────────────────

interface PocFormProps {
  poc?: Poc | null        // If provided, edit mode. Otherwise create mode.
  partnerId: number
  isOpen: boolean
  onClose: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PocForm({ poc, partnerId, isOpen, onClose }: PocFormProps) {
  const isEdit = poc != null
  const createPoc = useCreatePoc(partnerId)
  const updatePoc = useUpdatePoc(partnerId)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      poc_name: '',
      poc_designation: '',
      poc_contact: '',
      poc_email: '',
      date_of_first_contact: '',
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (poc) {
      form.reset({
        poc_name: poc.poc_name ?? '',
        poc_designation: poc.poc_designation ?? '',
        poc_contact: poc.poc_contact ?? '',
        poc_email: poc.poc_email ?? '',
        date_of_first_contact: poc.date_of_first_contact
          ? poc.date_of_first_contact.split('T')[0]
          : '',
      })
    } else {
      form.reset({
        poc_name: '',
        poc_designation: '',
        poc_contact: '',
        poc_email: '',
        date_of_first_contact: '',
      })
    }
  }, [poc, isOpen])

  function handleClose() {
    form.reset()
    onClose()
  }

  function onSubmit(values: FormValues) {
    const onSuccess = () => {
      toast.success(isEdit ? 'POC updated successfully' : 'POC created successfully')
      handleClose()
    }

    const onError = (err: unknown) => {
      // Handle duplicate contact 409
      const apiErr = err as { response?: { data?: { message?: string } }; status?: number }
      if (apiErr?.response?.data?.message?.toLowerCase().includes('duplicate') ||
          (apiErr as { response?: { status?: number } })?.response?.status === 409) {
        toast.error('A POC with this contact number already exists for this partner')
        return
      }
      const msg = apiErr?.response?.data?.message ?? 'Operation failed'
      toast.error(msg)
    }

    if (isEdit && poc) {
      const updateData: UpdatePocInput = {}
      if (values.poc_name) updateData.poc_name = values.poc_name
      if (values.poc_designation !== undefined) updateData.poc_designation = values.poc_designation
      if (values.poc_contact) updateData.poc_contact = values.poc_contact
      if (values.poc_email !== undefined) updateData.poc_email = values.poc_email
      if (values.date_of_first_contact) updateData.date_of_first_contact = values.date_of_first_contact

      updatePoc.mutate({ id: poc.id, data: updateData }, { onSuccess, onError })
    } else {
      const createData: CreatePocInput = {
        partner_id: partnerId,
        poc_name: values.poc_name,
        poc_designation: values.poc_designation,
        poc_contact: values.poc_contact,
        poc_email: values.poc_email || undefined,
        date_of_first_contact: values.date_of_first_contact || undefined,
      }
      createPoc.mutate(createData, { onSuccess, onError })
    }
  }

  const isPending = createPoc.isPending || updatePoc.isPending

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="size-5 text-primary" />
            {isEdit ? 'Edit POC' : 'Add New POC'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="poc_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Ravi Kumar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Designation */}
            <FormField
              control={form.control}
              name="poc_designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Principal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact */}
            <FormField
              control={form.control}
              name="poc_contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="poc_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date of first contact */}
            {!isEdit && (
              <FormField
                control={form.control}
                name="date_of_first_contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of First Contact</FormLabel>
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
                disabled={isPending}
              >
                {isPending ? (isEdit ? 'Saving…' : 'Adding…') : isEdit ? 'Save Changes' : 'Add POC'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
