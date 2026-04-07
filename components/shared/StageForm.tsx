'use client'

import { useEffect, useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStates, useCities, useCOUsers } from '@/hooks/useReference'
import type { FormField as FormFieldConfig } from '@/components/modules/lead/LeadForm/config'
import { cn } from '@/lib/utils'

interface StageFormProps {
  fields: FormFieldConfig[]
}

export function StageForm({ fields }: StageFormProps) {
  const { control, watch, setValue } = useFormContext()

  // Always call all reference hooks — hooks cannot be conditional
  const { data: statesData } = useStates()
  const stateId = watch('state_id')
  const { data: citiesData } = useCities(stateId ? Number(stateId) : null)
  const { data: coUsersData } = useCOUsers()

  // Reset city_id when state_id changes
  const prevStateId = useRef<unknown>(undefined)
  useEffect(() => {
    if (prevStateId.current !== undefined && prevStateId.current !== stateId) {
      setValue('city_id', '')
    }
    prevStateId.current = stateId
  }, [stateId, setValue])

  const getOptions = (field: FormFieldConfig): Array<{ value: string | number; label: string }> => {
    if (field.apiSource === 'states') {
      return (statesData ?? []).map((s) => ({ value: s.id, label: s.state_name }))
    }
    if (field.apiSource === 'cities') {
      return (citiesData ?? []).map((c) => ({ value: c.id, label: c.city_name }))
    }
    if (field.apiSource === 'co-users') {
      return (coUsersData ?? []).map((u) => ({ value: u.user_id, label: u.user_display_name }))
    }
    return field.options ?? []
  }

  return (
    <div className="space-y-4">
      {fields.map((fieldConfig) => {
        const options = getOptions(fieldConfig)

        // ── Select / Cascading-Select ─────────────────────────────────────────
        if (fieldConfig.type === 'select' || fieldConfig.type === 'cascading-select') {
          const isCascading = fieldConfig.type === 'cascading-select'
          return (
            <FormField
              key={fieldConfig.name}
              control={control}
              name={fieldConfig.name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {fieldConfig.label}
                    {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value != null ? String(field.value) : ''}
                      disabled={isCascading && !stateId}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isCascading && !stateId
                              ? 'Select a state first'
                              : (fieldConfig.placeholder ?? `Select ${fieldConfig.label}`)
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((opt) => (
                          <SelectItem key={String(opt.value)} value={String(opt.value)}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {fieldConfig.hint && <FormDescription>{fieldConfig.hint}</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />
          )
        }

        // ── Radio ─────────────────────────────────────────────────────────────
        if (fieldConfig.type === 'radio') {
          return (
            <FormField
              key={fieldConfig.name}
              control={control}
              name={fieldConfig.name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {fieldConfig.label}
                    {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
                  </FormLabel>
                  <FormControl>
                    <div className="flex gap-3 flex-wrap">
                      {(fieldConfig.options ?? []).map((opt) => (
                        <label
                          key={String(opt.value)}
                          className={cn(
                            'flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border text-sm transition-all select-none',
                            field.value === String(opt.value)
                              ? 'border-primary bg-primary/5 text-primary font-medium'
                              : 'border-border hover:border-primary/50',
                          )}
                        >
                          <input
                            type="radio"
                            className="sr-only"
                            value={String(opt.value)}
                            checked={field.value === String(opt.value)}
                            onChange={() => field.onChange(String(opt.value))}
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </FormControl>
                  {fieldConfig.hint && <FormDescription>{fieldConfig.hint}</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />
          )
        }

        // ── Multi-Select (checkboxes) ─────────────────────────────────────────
        if (fieldConfig.type === 'multi-select') {
          return (
            <FormField
              key={fieldConfig.name}
              control={control}
              name={fieldConfig.name}
              render={({ field }) => {
                const current: string[] = Array.isArray(field.value) ? field.value : []
                return (
                  <FormItem>
                    <FormLabel>
                      {fieldConfig.label}
                      {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
                    </FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-3 gap-2">
                        {(fieldConfig.options ?? []).map((opt) => {
                          const isChecked = current.includes(String(opt.value))
                          return (
                            <label
                              key={String(opt.value)}
                              className={cn(
                                'flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border text-sm transition-all select-none',
                                isChecked
                                  ? 'border-primary bg-primary/5 text-primary font-medium'
                                  : 'border-border hover:border-primary/50',
                              )}
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    field.onChange([...current, String(opt.value)])
                                  } else {
                                    field.onChange(current.filter((v) => v !== String(opt.value)))
                                  }
                                }}
                              />
                              {opt.label}
                            </label>
                          )
                        })}
                      </div>
                    </FormControl>
                    {fieldConfig.hint && <FormDescription>{fieldConfig.hint}</FormDescription>}
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          )
        }

        // ── Textarea ──────────────────────────────────────────────────────────
        if (fieldConfig.type === 'textarea') {
          return (
            <FormField
              key={fieldConfig.name}
              control={control}
              name={fieldConfig.name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {fieldConfig.label}
                    {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={fieldConfig.placeholder}
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  {fieldConfig.hint && <FormDescription>{fieldConfig.hint}</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />
          )
        }

        // ── File ──────────────────────────────────────────────────────────────
        if (fieldConfig.type === 'file') {
          return (
            <FormField
              key={fieldConfig.name}
              control={control}
              name={fieldConfig.name}
              render={({ field: { onChange, ref } }) => (
                <FormItem>
                  <FormLabel>
                    {fieldConfig.label}
                    {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      ref={ref}
                      onChange={(e) => onChange(e.target.files?.[0] ?? null)}
                    />
                  </FormControl>
                  {fieldConfig.hint && <FormDescription>{fieldConfig.hint}</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />
          )
        }

        // ── Text / Number / Date (default) ────────────────────────────────────
        return (
          <FormField
            key={fieldConfig.name}
            control={control}
            name={fieldConfig.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {fieldConfig.label}
                  {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    type={
                      fieldConfig.type === 'number'
                        ? 'number'
                        : fieldConfig.type === 'date'
                          ? 'date'
                          : 'text'
                    }
                    placeholder={fieldConfig.placeholder}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                {fieldConfig.hint && <FormDescription>{fieldConfig.hint}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        )
      })}
    </div>
  )
}
