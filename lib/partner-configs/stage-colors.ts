export const STAGE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  // School stages
  new: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  first_conversation: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  interested: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  interested_but_facing_delay: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  not_interested: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  converted: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  dropped: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  // Sourcing stages
  identified: { bg: 'bg-sky-100', text: 'text-sky-700', dot: 'bg-sky-500' },
  first_contact: { bg: 'bg-violet-100', text: 'text-violet-700', dot: 'bg-violet-500' },
  in_discussion: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  onboarded: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  paused: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  // Funder stages
  prospect: { bg: 'bg-cyan-100', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  agreed: { bg: 'bg-teal-100', text: 'text-teal-700', dot: 'bg-teal-500' },
  committed: { bg: 'bg-teal-100', text: 'text-teal-700', dot: 'bg-teal-500' },
  active: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  // Vendor stages
  contacted: { bg: 'bg-violet-100', text: 'text-violet-700', dot: 'bg-violet-500' },
  approved: { bg: 'bg-teal-100', text: 'text-teal-700', dot: 'bg-teal-500' },
  evaluated: { bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  empanelled: { bg: 'bg-teal-100', text: 'text-teal-700', dot: 'bg-teal-500' },
  inactive: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
}
