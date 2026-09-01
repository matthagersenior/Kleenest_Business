import { getSupabaseClient } from '@/lib/supabase';

export type EngagementRecord = {
  id?: string;
  name?: string | null;
  title?: string | null;
  label?: string | null;
  status?: string | null;
  active?: boolean | null;
  location_id?: string | null;
  code?: string | null;
  [key: string]: unknown;
};

function client() {
  return getSupabaseClient();
}

function unwrap<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message);
  if (data == null) throw new Error('Canonical Business engagement service returned no data.');
  return data;
}

function windowArgs(businessId: string, days = 30) {
  const end = new Date();
  const start = new Date(end.getTime() - days * 86_400_000);
  return {
    p_business_id: businessId,
    p_start: start.toISOString(),
    p_end: end.toISOString(),
  };
}

export async function listCampaigns(businessId: string): Promise<EngagementRecord[]> {
  const { data, error } = await client().rpc('business_list_campaigns', { p_business_id: businessId });
  return unwrap((data ?? []) as EngagementRecord[], error);
}

export async function manageCampaign(
  businessId: string,
  campaignId: string | null,
  action: 'create' | 'update' | 'pause' | 'activate',
  input: { name?: string; campaignType?: string; goal?: string; status?: string } = {},
) {
  const { data, error } = await client().rpc('business_manage_campaign', {
    p_business_id: businessId,
    p_campaign_id: campaignId,
    p_action: action,
    p_name: input.name ?? null,
    p_campaign_type: input.campaignType ?? null,
    p_goal: input.goal ?? null,
    p_status: input.status ?? null,
  });
  return unwrap(data as Record<string, unknown> | null, error);
}

export async function listContests(businessId: string): Promise<EngagementRecord[]> {
  const { data, error } = await client().rpc('business_list_contests', { p_business_id: businessId });
  return unwrap((data ?? []) as EngagementRecord[], error);
}

export async function manageContest(
  businessId: string,
  contestId: string | null,
  action: 'create' | 'update' | 'activate' | 'pause' | 'resume' | 'delete',
  payload: Record<string, unknown> = {},
) {
  const { data, error } = await client().rpc('business_manage_contest', {
    p_business_id: businessId,
    p_contest_id: contestId,
    p_action: action,
    p_payload: payload,
  });
  return unwrap(data as Record<string, unknown> | null, error);
}

export async function listEvents(businessId: string): Promise<EngagementRecord[]> {
  const { data, error } = await client().rpc('business_list_events', { p_business_id: businessId });
  return unwrap((data ?? []) as EngagementRecord[], error);
}

export async function manageEvent(
  businessId: string,
  eventId: string | null,
  action: 'create' | 'update' | 'delete',
  payload: Record<string, unknown> = {},
) {
  const { data, error } = await client().rpc('business_manage_event', {
    p_business_id: businessId,
    p_event_id: eventId,
    p_action: action,
    p_payload: payload,
  });
  return unwrap(data as Record<string, unknown> | null, error);
}

export async function managePromotion(
  businessId: string,
  promotionId: string | null,
  action: 'create' | 'update' | 'deactivate',
  payload: Record<string, unknown> = {},
) {
  const { data, error } = await client().rpc('business_manage_promotion', {
    p_business_id: businessId,
    p_promotion_id: promotionId,
    p_action: action,
    p_payload: payload,
  });
  return unwrap(data as Record<string, unknown> | null, error);
}

export async function manageQr(
  businessId: string,
  locationId: string | null,
  qrId: string | null,
  action: 'create' | 'update' | 'deactivate',
  payload: Record<string, unknown> = {},
) {
  const { data, error } = await client().rpc('business_manage_qr', {
    p_business_id: businessId,
    p_location_id: locationId,
    p_qr_id: qrId,
    p_action: action,
    p_payload: payload,
  });
  return unwrap(data as Record<string, unknown> | null, error);
}

export async function getEngagementBundle(businessId: string, days = 30) {
  const args = windowArgs(businessId, days);
  const [engagement, campaigns, events, promotions, qr] = await Promise.all([
    client().rpc('business_engagement_analytics', args),
    client().rpc('business_campaign_detail', args),
    client().rpc('business_event_detail', args),
    client().rpc('business_promotion_detail', args),
    client().rpc('business_qr_detail', args),
  ]);

  for (const response of [engagement, campaigns, events, promotions, qr]) {
    if (response.error) throw new Error(response.error.message);
  }

  return {
    engagement: engagement.data,
    campaigns: campaigns.data,
    events: events.data,
    promotions: promotions.data,
    qr: qr.data,
  };
}

export async function recordBusinessAttribution(
  businessId: string,
  input: {
    locationId?: string | null;
    partnerNetworkId?: string | null;
    campaignId?: string | null;
    activityType: string;
    source?: string;
    metadata?: Record<string, unknown>;
  },
) {
  const { data, error } = await client().rpc('record_business_engagement_attribution', {
    p_business_id: businessId,
    p_location_id: input.locationId ?? null,
    p_partner_network_id: input.partnerNetworkId ?? null,
    p_campaign_id: input.campaignId ?? null,
    p_activity_type: input.activityType,
    p_source: input.source ?? 'business_app',
    p_metadata: input.metadata ?? {},
  });
  return unwrap(data as Record<string, unknown> | null, error);
}
