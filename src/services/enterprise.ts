import { getSupabaseClient } from '@/lib/supabase';

function client(){return getSupabaseClient();}
function unwrap<T>(data:T|null,error:{message:string}|null):T{if(error)throw new Error(error.message);if(data==null)throw new Error('Enterprise service returned no data.');return data;}

export async function enterpriseAuthorized(businessId:string){const {data,error}=await client().rpc('business_enterprise_authorized',{p_business_id:businessId});return unwrap(Boolean(data),error);}
export async function getEnterpriseControlPlaneSnapshot(businessId:string,windowDays=30){const {data,error}=await client().rpc('enterprise_control_plane_snapshot',{p_business_id:businessId,p_window_days:windowDays});return unwrap(data as Record<string,unknown>|null,error);}
export async function listOwnedEnterpriseNetworks(businessId:string){const {data,error}=await client().rpc('enterprise_list_owned_networks',{p_business_id:businessId});return unwrap((data??[]) as Array<Record<string,unknown>>,error);}
export async function listEnterprisePartnerBusinesses(businessId:string){const {data,error}=await client().rpc('enterprise_list_partner_businesses',{p_business_id:businessId});return unwrap((data??[]) as Array<Record<string,unknown>>,error);}
export async function listEnterpriseNetworkMembers(networkId:string){const {data,error}=await client().rpc('enterprise_list_network_members',{p_network_id:networkId});return unwrap((data??[]) as Array<Record<string,unknown>>,error);}
export async function listEnterpriseNetworkCampaigns(networkId:string){const {data,error}=await client().rpc('enterprise_list_network_campaigns',{p_network_id:networkId});return unwrap((data??[]) as Array<Record<string,unknown>>,error);}
export async function createEnterpriseNetwork(name:string){const {data,error}=await client().rpc('create_enterprise_partner_network',{p_name:name});return unwrap(data,error);}
export async function updateEnterpriseNetwork(networkId:string,name:string,enabled:boolean){const {data,error}=await client().rpc('enterprise_update_network',{p_network_id:networkId,p_name:name,p_enabled:enabled});return unwrap(data,error);}
export async function inviteEnterprisePartner(networkId:string,partnerBusinessId:string){const {data,error}=await client().rpc('invite_enterprise_partner',{p_network_id:networkId,p_partner_business_id:partnerBusinessId});return unwrap(data,error);}
export async function setEnterprisePartnerStatus(membershipId:string,status:string){const {data,error}=await client().rpc('set_enterprise_partner_status',{p_membership_id:membershipId,p_status:status});return unwrap(data,error);}
export async function createEnterpriseCampaign(networkId:string,name:string,campaignType:string,goal:string){const {data,error}=await client().rpc('create_enterprise_partner_campaign',{p_network_id:networkId,p_name:name,p_campaign_type:campaignType,p_goal:goal});return unwrap(data,error);}
export async function activateEnterpriseCampaign(campaignId:string){const {data,error}=await client().rpc('activate_enterprise_partner_campaign',{p_campaign_id:campaignId});return unwrap(data,error);}
export async function pauseEnterpriseCampaign(campaignId:string){const {data,error}=await client().rpc('pause_enterprise_partner_campaign',{p_campaign_id:campaignId});return unwrap(data,error);}
