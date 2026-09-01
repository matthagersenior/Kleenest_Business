export type BusinessPlan = 'none' | 'standard' | 'growth' | 'enterprise';
export type EffectiveBusinessPlan = Exclude<BusinessPlan, 'none'>;
export type BusinessRole =
  | 'business_owner'
  | 'business_admin'
  | 'business_manager'
  | 'business_analyst'
  | 'business_marketing'
  | 'business_staff';

export type BusinessCapability =
  | 'business.read'
  | 'business.update'
  | 'locations.read'
  | 'locations.manage'
  | 'staff.read'
  | 'staff.manage'
  | 'reviews.read'
  | 'reviews.reply'
  | 'engagement.manage'
  | 'qr.manage'
  | 'analytics.basic'
  | 'analytics.advanced'
  | 'recommendations.read'
  | 'reports.generate'
  | 'audits.read'
  | 'data_quality.read'
  | 'integrations.manage'
  | 'billing.manage'
  | 'fleet.link'
  | 'enterprise.governance';

const STANDARD_CAPABILITIES: BusinessCapability[] = [
  'business.read',
  'business.update',
  'locations.read',
  'locations.manage',
  'staff.read',
  'reviews.read',
  'reviews.reply',
  'engagement.manage',
  'qr.manage',
  'analytics.basic',
];

const GROWTH_CAPABILITIES: BusinessCapability[] = [
  ...STANDARD_CAPABILITIES,
  'analytics.advanced',
  'recommendations.read',
  'reports.generate',
  'audits.read',
  'data_quality.read',
];

const ENTERPRISE_CAPABILITIES: BusinessCapability[] = [
  ...GROWTH_CAPABILITIES,
  'integrations.manage',
  'fleet.link',
  'enterprise.governance',
];

export const PLAN_CAPABILITIES: Record<EffectiveBusinessPlan, readonly BusinessCapability[]> = {
  standard: STANDARD_CAPABILITIES,
  growth: GROWTH_CAPABILITIES,
  enterprise: ENTERPRISE_CAPABILITIES,
};

export const ROLE_CAPABILITIES: Record<BusinessRole, readonly BusinessCapability[]> = {
  business_owner: [...ENTERPRISE_CAPABILITIES, 'staff.manage', 'billing.manage'],
  business_admin: [...ENTERPRISE_CAPABILITIES, 'staff.manage'],
  business_manager: [
    'business.read',
    'business.update',
    'locations.read',
    'locations.manage',
    'staff.read',
    'reviews.read',
    'reviews.reply',
    'engagement.manage',
    'qr.manage',
    'analytics.basic',
    'analytics.advanced',
    'recommendations.read',
    'reports.generate',
    'audits.read',
    'data_quality.read',
  ],
  business_analyst: [
    'business.read',
    'locations.read',
    'reviews.read',
    'analytics.basic',
    'analytics.advanced',
    'recommendations.read',
    'reports.generate',
    'audits.read',
    'data_quality.read',
  ],
  business_marketing: [
    'business.read',
    'locations.read',
    'reviews.read',
    'reviews.reply',
    'engagement.manage',
    'qr.manage',
    'analytics.basic',
    'recommendations.read',
    'reports.generate',
  ],
  business_staff: ['business.read', 'locations.read', 'reviews.read', 'analytics.basic'],
};

export type BusinessAccessContext = {
  /** Purchased Business plan. Fleet customers may have `none` because Standard is bundled. */
  plan: BusinessPlan;
  role: BusinessRole;
  /** Canonical active locations managed through Business. */
  locationCount: number;
  /** Active Fleet product entitlement. Fleet includes Business Standard. */
  fleetEnabled: boolean;
  /** Number of locations Fleet is configured to monitor. */
  fleetMonitoredLocationCount: number;
};

export function effectiveBusinessPlan(context: BusinessAccessContext): EffectiveBusinessPlan | null {
  if (context.plan !== 'none') return context.plan;
  if (context.fleetEnabled) return 'standard';
  return null;
}

export function can(context: BusinessAccessContext, capability: BusinessCapability): boolean {
  const plan = effectiveBusinessPlan(context);
  if (!plan) return false;
  return PLAN_CAPABILITIES[plan].includes(capability) && ROLE_CAPABILITIES[context.role].includes(capability);
}

export function canAddBusinessLocation(context: BusinessAccessContext): boolean {
  const plan = effectiveBusinessPlan(context);
  if (plan === 'enterprise') return true;
  if (plan === 'growth') return context.locationCount < 5;
  if (plan === 'standard') return context.locationCount < 1;
  return false;
}

export function canMonitorFleetLocation(context: BusinessAccessContext): boolean {
  if (!context.fleetEnabled) return false;
  if (context.plan === 'enterprise') return true;
  return context.fleetMonitoredLocationCount < 1;
}

export function validateBusinessPlan(context: BusinessAccessContext): string[] {
  const problems: string[] = [];
  const plan = effectiveBusinessPlan(context);

  if (plan === 'growth' && context.locationCount > 5) {
    problems.push('Growth is limited to 5 Business locations; Enterprise is required for 6 or more.');
  }
  if (plan === 'standard' && context.locationCount > 1) {
    problems.push('Business Standard is limited to one Business location.');
  }
  if (context.fleetEnabled && context.fleetMonitoredLocationCount > 1 && context.plan !== 'enterprise') {
    problems.push('Fleet monitoring is limited to one location unless Enterprise is active.');
  }
  return problems;
}
