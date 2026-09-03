import { getSupabaseClient } from '@/lib/supabase';

// Canonical claims keep Business CRUD, Consumer trust history, Fleet routing and Enterprise analytics on one location ID.
export type ClaimableLocation = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  place_type: string | null;
  phone: string | null;
  website: string | null;
  rating: number | null;
  review_count: number | null;
  claim_status: string;
};

export type BusinessLocationClaim = {
  claim_id: string;
  location_id: string;
  location_name: string;
  status: string;
  created_at: string;
  updated_at: string;
};

const client = () => getSupabaseClient();

function unwrap<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message);
  if (data == null) throw new Error('Location claim service returned no data.');
  return data;
}

export async function searchClaimableLocations(
  businessId: string,
  query: string,
  limit = 40,
): Promise<ClaimableLocation[]> {
  const { data, error } = await client().rpc('business_search_claimable_locations', {
    p_business_id: businessId,
    p_query: query.trim() || null,
    p_limit: limit,
  });
  return unwrap((data ?? []) as ClaimableLocation[], error);
}

export async function listBusinessLocationClaims(
  businessId: string,
): Promise<BusinessLocationClaim[]> {
  const { data, error } = await client().rpc('business_list_location_claims', {
    p_business_id: businessId,
  });
  return unwrap((data ?? []) as BusinessLocationClaim[], error);
}

export async function requestLocationClaim(
  businessId: string,
  locationId: string,
): Promise<string> {
  const { data, error } = await client().rpc('claim_location_for_business', {
    p_location_id: locationId,
    p_business_id: businessId,
  });
  return String(unwrap(data as string | null, error));
}
