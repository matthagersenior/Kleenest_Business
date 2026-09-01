import { getSupabaseClient } from '@/lib/supabase';

export type BusinessWorkspace = {
  id: string;
  business_id: string;
  user_id: string;
  role: string;
  created_at: string;
  business_name: string | null;
  name: string | null;
  business_tier: string | null;
  is_demo_test: boolean;
};

export type BusinessProductAccess = {
  business_id: string;
  plan: string;
  location_count: number;
  location_limit: number | null;
  enterprise_enabled: boolean;
  fleet_enabled: boolean;
  is_admin: boolean;
};

export type BusinessLocation = {
  id: string;
  business_id?: string | null;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  phone?: string | null;
  website?: string | null;
  is_active?: boolean | null;
  active?: boolean | null;
  [key: string]: unknown;
};

export type BusinessAmenity = {
  amenity_id: string;
  name: string;
  category: string | null;
};

export type BusinessMedia = {
  id: string;
  location_id: string | null;
  location_name: string | null;
  storage_path: string;
  caption: string | null;
  media_type: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  sort_order: number | null;
  created_at: string;
};

export type BusinessProfileUpdate = {
  name: string;
  description?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  logo_url?: string | null;
};

function client() {
  return getSupabaseClient();
}

function unwrap<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message);
  if (data == null) throw new Error('Canonical Business service returned no data.');
  return data;
}

export async function getCurrentSession() {
  const { data, error } = await client().auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function listBusinessWorkspaces(includeDemo = false): Promise<BusinessWorkspace[]> {
  const { data, error } = await client().rpc('business_list_workspaces', {
    p_include_demo: includeDemo,
  });
  return unwrap((data ?? []) as BusinessWorkspace[], error);
}

export async function getBusinessProductAccess(businessId: string): Promise<BusinessProductAccess> {
  const { data, error } = await client().rpc('get_business_product_access', {
    p_business_id: businessId,
  });
  const rows = unwrap((data ?? []) as BusinessProductAccess[], error);
  if (!rows[0]) throw new Error('No Business product access is available for this workspace.');
  return rows[0];
}

export async function getBusinessServiceEntitlement(businessId: string) {
  const { data, error } = await client().rpc('get_business_service_entitlement', {
    p_business_id: businessId,
  });
  return unwrap(data as Record<string, unknown> | null, error);
}

export async function getBusinessManagementContext(businessId: string) {
  const { data, error } = await client().rpc('business_management_context', {
    p_business_id: businessId,
  });
  return unwrap(data as Record<string, unknown> | null, error);
}

export async function getBusinessProfile(businessId: string) {
  const { data, error } = await client().rpc('business_get_profile', {
    p_business_id: businessId,
  });
  return unwrap(data as Record<string, unknown> | null, error);
}

export async function updateBusinessProfile(businessId: string, input: BusinessProfileUpdate) {
  const { data, error } = await client().rpc('business_update_profile', {
    p_business_id: businessId,
    p_name: input.name,
    p_description: input.description ?? null,
    p_website: input.website ?? null,
    p_phone: input.phone ?? null,
    p_email: input.email ?? null,
    p_logo_url: input.logo_url ?? null,
  });
  return unwrap(data, error);
}

export async function listBusinessLocations(businessId: string): Promise<BusinessLocation[]> {
  const { data, error } = await client().rpc('business_list_locations', {
    p_business_id: businessId,
  });
  return unwrap((data ?? []) as BusinessLocation[], error);
}

export async function manageBusinessLocation(
  businessId: string,
  locationId: string | null,
  action: string,
  payload: Record<string, unknown>,
) {
  const { data, error } = await client().rpc('business_manage_location', {
    p_business_id: businessId,
    p_location_id: locationId,
    p_action: action,
    p_payload: payload,
  });
  return unwrap(data, error);
}

export async function listLocationAmenities(
  businessId: string,
  locationId: string,
): Promise<BusinessAmenity[]> {
  const { data, error } = await client().rpc('business_list_amenities', {
    p_business_id: businessId,
    p_location_id: locationId,
  });
  return unwrap((data ?? []) as BusinessAmenity[], error);
}

export async function setLocationAmenity(
  businessId: string,
  locationId: string,
  amenityId: string,
  action: 'add' | 'remove',
) {
  const { data, error } = await client().rpc('business_set_location_amenity', {
    p_business_id: businessId,
    p_location_id: locationId,
    p_amenity_id: amenityId,
    p_action: action,
  });
  return unwrap(data, error);
}

export async function listBusinessMedia(businessId: string): Promise<BusinessMedia[]> {
  const { data, error } = await client().rpc('business_list_media', {
    p_business_id: businessId,
  });
  return unwrap((data ?? []) as BusinessMedia[], error);
}

export async function getBusinessReviewDetail(businessId: string, days = 30) {
  const end = new Date();
  const start = new Date(end.getTime() - days * 86_400_000);
  const { data, error } = await client().rpc('business_review_detail', {
    p_business_id: businessId,
    p_start: start.toISOString(),
    p_end: end.toISOString(),
  });
  return unwrap(data as Record<string, unknown> | unknown[] | null, error);
}

export async function replyToBusinessReview(
  businessId: string,
  reviewId: string,
  reply: string,
) {
  const { data, error } = await client().rpc('business_reply_review', {
    p_business_id: businessId,
    p_review_id: reviewId,
    p_reply: reply,
  });
  return unwrap(data as Record<string, unknown> | null, error);
}

export async function getBusinessDashboardSummary(businessId: string, days = 30) {
  const end = new Date();
  const start = new Date(end.getTime() - days * 86_400_000);
  const { data, error } = await client().rpc('business_dashboard_secure_summary', {
    p_business_id: businessId,
    p_start: start.toISOString(),
    p_end: end.toISOString(),
  });
  return unwrap(data as Record<string, unknown> | null, error);
}
