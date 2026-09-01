export type BusinessPlan = 'standard' | 'growth' | 'enterprise';
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

export const PLAN_CAPABILITIES: Record<BusinessPlan, readonly BusinessCapability[]> = {
  standard: STANDARD_CAPABILITIES,
  growth: GROWTH_CAPABILITIES,
  enterprise: ENTERPRISE_CAPABILITIES,
};

export const ROLE_CAPABILITIES: Record<BusinessRole, readonly BusinessCapability[]> = {
  business_owner: [
    ...ENTERPRISE_CAPABILITIES,
    'staff.manage',
    'billing.manage',
  ],
  business_admin: [
    ...ENTERPRISE_CAPABILITIES,
    'staff.manage',
  ],
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
  business_staff: [
    'business.read',
    'locations.read',
    'reviews.read',
    'analytics.basic',
  ],
};

export type BusinessAccessContext = {
  plan: BusinessPlan;
  role: BusinessRole;
  locationCount: number;
  fleetEnabled: boolean;
};

export function effectiveBusinessPlan(context: BusinessAccessContext): BusinessPlan {
  // Fleet is a separately purchased product, but it promotes Business tooling to
  // the Enterprise capability bundle. Location count alone never grants access.
  if (context.fleetEnabled) return 'enterprise';
  return context.plan;
}

export function can(
  context: BusinessAccessContext,
  capability: BusinessCapability,
): boolean {
  const plan = effectiveBusinessPlan(context);
  return (
    PLAN_CAPABILITIES[plan].includes(capability) &&
    ROLE_CAPABILITIES[context.role].includes(capability)
  );
}

export function canAddLocation(context: BusinessAccessContext): boolean {
  const effectivePlan = effectiveBusinessPlan(context);
  if (effectivePlan === 'enterprise') return true;
  if (context.plan === 'growth') return context.locationCount < 5;
  return context.locationCount < 1;
}

export function validateBusinessPlan(context: BusinessAccessContext): string[] {
  const problems: string[] = [];
  if (context.plan === 'growth' && !context.fleetEnabled && context.locationCount > 5) {
    problems.push('Growth is limited to 5 locations; Enterprise is required for 6 or more.');
  }
  if (context.plan === 'standard' && !context.fleetEnabled && context.locationCount > 1) {
    problems.push('Standard is a single-location plan. Growth or Enterprise is required for additional locations.');
  }
  return problems;
}
