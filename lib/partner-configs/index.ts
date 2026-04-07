export * from './types'
export * from './stage-colors'
export * from './sourcing.config'
export * from './funder.config'
export * from './vendor.config'

import type { EntityType, PartnerTypeConfig } from './types'
import { SOURCING_CONFIG } from './sourcing.config'
import { FUNDER_CONFIG } from './funder.config'
import { VENDOR_CONFIG } from './vendor.config'

const CONFIG_MAP: Record<EntityType, PartnerTypeConfig | null> = {
  school: null,      // School config lives in existing lead module
  sourcing: SOURCING_CONFIG,
  funder: FUNDER_CONFIG,
  vendor: VENDOR_CONFIG,
}

/**
 * Returns the PartnerTypeConfig for a given entity type.
 * Throws if the config has not yet been defined (i.e., Phase D+ modules).
 */
export function getPartnerConfig(entityType: EntityType): PartnerTypeConfig {
  const config = CONFIG_MAP[entityType]
  if (!config) {
    throw new Error(`Partner config for entity type "${entityType}" is not yet implemented.`)
  }
  return config
}

/**
 * Returns the PartnerTypeConfig or null if not yet implemented.
 * Useful in generic components that handle missing configs gracefully.
 */
export function getPartnerConfigOrNull(entityType: EntityType): PartnerTypeConfig | null {
  return CONFIG_MAP[entityType]
}
