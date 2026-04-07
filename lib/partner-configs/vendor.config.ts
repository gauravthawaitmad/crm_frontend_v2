import type { PartnerTypeConfig } from './types'
import { STAGE_COLORS } from './stage-colors'

export const VENDOR_CONFIG: PartnerTypeConfig = {
  entityType: 'vendor',
  label: 'Vendors',
  singularLabel: 'Vendor',
  icon: 'Package',
  baseRoute: '/partnerships/vendors',
  apiRoute: '/vendors',

  stages: [
    { id: 'identified', label: 'Identified',  ...STAGE_COLORS.identified,  description: 'Found this vendor, no work yet' },
    { id: 'contacted',  label: 'Contacted',   ...STAGE_COLORS.contacted,   description: 'Initial discussion done' },
    { id: 'approved',   label: 'Approved',    ...STAGE_COLORS.approved,    description: 'Assessed and ready to use' },
    { id: 'active',     label: 'Active',      ...STAGE_COLORS.active,      description: 'Currently working with them' },
    { id: 'inactive',   label: 'Inactive',    ...STAGE_COLORS.inactive,    description: 'Not using currently' },
    { id: 'dropped',    label: 'Dropped',     ...STAGE_COLORS.dropped,     description: 'Not working with anymore', isTerminal: true, isDropped: true },
  ],

  initialStage: 'identified',
  terminalStages: ['dropped'],

  dropReasons: [
    { value: 'poor_performance',   label: 'Poor Performance' },
    { value: 'unavailable',        label: 'Unavailable / Shut Down' },
    { value: 'better_alternative', label: 'Found Better Alternative' },
    { value: 'one_time_use',       label: 'One-time Use Only' },
    { value: 'pricing_issues',     label: 'Pricing Issues' },
    { value: 'other',              label: 'Other' },
  ],

  listColumns: [
    { key: 'name',              label: 'Vendor',       bold: true },
    { key: 'vendor_type',       label: 'Type',         badge: true },
    { key: 'status',            label: 'Stage',        stageConfig: true },
    { key: 'average_rating',    label: 'Rating',       render: 'star_rating' },
    { key: 'total_engagements', label: 'Engagements',  render: 'number' },
    { key: 'assigned_co',       label: 'CO',           avatar: true },
    { key: 'updatedAt',         label: 'Last Updated', relative: true },
  ],

  detailTabs: [
    { id: 'overview',      label: 'Overview' },
    { id: 'engagements',   label: 'Engagements' },
    { id: 'contacts',      label: 'POCs' },
    { id: 'interactions',  label: 'Interactions' },
    { id: 'school-tags',   label: 'Schools' },
    { id: 'comments',      label: 'Comments' },
  ],

  hasCommitments: false,
  hasDeliverables: false,
  hasEngagements: true,
  hasSchoolTags: true,
  hasKanban: true,
  hasExport: true,
  canReallocateCo: true,
  canReactivate: true,

  createFormFields: [
    {
      name: 'name', label: 'Vendor Name', type: 'text', required: true,
      placeholder: 'PrintFast, EventPro...',
    },
    {
      name: 'vendor_type', label: 'Type', type: 'select', required: true,
      options: [
        { label: 'Facilitator',       value: 'facilitator' },
        { label: 'Speaker',           value: 'speaker' },
        { label: 'Printer / Materials', value: 'printer' },
        { label: 'Venue Provider',    value: 'venue_provider' },
        { label: 'Event Service',     value: 'event_service' },
        { label: 'Other',             value: 'other' },
      ],
    },
    {
      name: 'services_description', label: 'Services They Provide', type: 'textarea', required: false,
      placeholder: 'What does this vendor do?',
    },
    { name: 'state_id', label: 'State', type: 'select', required: true, options: [] },
    { name: 'city_id',  label: 'City',  type: 'select', required: true, options: [] },
    { name: 'co_id',    label: 'Assign CO', type: 'select', required: true, options: [] },
  ],
}
