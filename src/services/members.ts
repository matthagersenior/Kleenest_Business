import { getSupabaseClient } from '@/lib/supabase';

const client = () => getSupabaseClient();
function unwrap<T>(data:T|null,error:{message:string}|null):T{if(error)throw new Error(error.message);if(data==null)throw new Error('Business membership service returned no data.');return data;}

export type BusinessMember = {
  id: string;
  business_id: string;
  user_id: string;
  role: string;
  created_at?: string;
  updated_at?: string;
  [key:string]: unknown;
};

export async function listBusinessMembers(businessId:string):Promise<BusinessMember[]> {
  const { data, error } = await client().from('business_members').select('*').eq('business_id', businessId).order('created_at', { ascending: true });
  return unwrap((data ?? []) as BusinessMember[], error);
}

export async function inviteBusinessMember(businessId:string,userId:string,role:string) {
  const { data, error } = await client().rpc('business_invite_member',{p_business_id:businessId,p_user_id:userId,p_role:role});
  return unwrap(data,error);
}

export async function changeBusinessMemberRole(businessId:string,userId:string,role:string) {
  const { data, error } = await client().rpc('business_change_member_role',{p_business_id:businessId,p_user_id:userId,p_role:role});
  return unwrap(data,error);
}

export async function removeBusinessMember(businessId:string,userId:string) {
  const { data, error } = await client().rpc('business_remove_member',{p_business_id:businessId,p_user_id:userId});
  return unwrap(Boolean(data),error);
}

export async function transferBusinessOwnership(businessId:string,newOwnerId:string) {
  const { data, error } = await client().rpc('business_transfer_ownership',{p_business_id:businessId,p_new_owner_id:newOwnerId});
  return unwrap(data,error);
}
