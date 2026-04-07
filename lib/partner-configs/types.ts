export type EntityType = 'school' | 'sourcing' | 'funder' | 'vendor'

export type OutcomeType = 'Positive' | 'Neutral' | 'Needs Follow-up' | 'No Response'

export type InteractionType =
  | 'Call'
  | 'In-Person Meeting'
  | 'Site Visit'
  | 'Online Meeting'
  | 'Email'
  | 'WhatsApp'

export interface StageDefinition {
  id: string
  label: string
  bg: string        // Tailwind bg class
  text: string      // Tailwind text class
  dot: string       // Tailwind bg class for dot
  description: string
  isTerminal?: boolean
  isDropped?: boolean
}

export interface ColumnConfig {
  key: string
  label: string
  bold?: boolean
  badge?: boolean
  stageConfig?: boolean
  avatar?: boolean
  relative?: boolean
  render?: string
}

export interface TabConfig {
  id: string
  label: string
}

export interface FormFieldConfig {
  name: string
  label: string
  type: 'text' | 'select' | 'number' | 'textarea' | 'date' | 'radio' | 'file'
  required?: boolean
  placeholder?: string
  options?: { label: string; value: string }[]
  hint?: string
}

export interface PartnerTypeConfig {
  entityType: EntityType
  label: string
  singularLabel: string
  icon: string
  baseRoute: string
  apiRoute: string
  stages: StageDefinition[]
  initialStage: string
  terminalStages: string[]
  dropReasons: { value: string; label: string }[]
  listColumns: ColumnConfig[]
  detailTabs: TabConfig[]
  hasCommitments: boolean
  hasDeliverables?: boolean
  hasEngagements?: boolean
  hasSchoolTags: boolean
  hasKanban: boolean
  hasExport: boolean
  canReallocateCo: boolean
  canReactivate: boolean
  createFormFields: FormFieldConfig[]
}
