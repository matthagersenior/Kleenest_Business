import { getSupabaseClient } from '@/lib/supabase';

function client(){return getSupabaseClient();}
function unwrap<T>(data:T|null,error:{message:string}|null):T{if(error)throw new Error(error.message);if(data==null)throw new Error('Canonical governance service returned no data.');return data;}

function window(days=30){const end=new Date();const start=new Date(end.getTime()-days*86_400_000);return{start:start.toISOString(),end:end.toISOString()};}

export async function listReportingSchedules(businessId:string){
 const {data,error}=await client().from('reporting_schedules').select('*').eq('scope_type','business').eq('scope_id',businessId).order('created_at',{ascending:false});
 return unwrap(data??[],error);
}

export async function createWeeklyBusinessReportSchedule(businessId:string,name='Weekly Business Report'){
 const {data:{user},error:userError}=await client().auth.getUser();
 if(userError)throw userError;if(!user)throw new Error('Authentication required.');
 const {data,error}=await client().from('reporting_schedules').insert({owner_id:user.id,scope_type:'business',scope_id:businessId,name,cadence:'weekly',day_of_week:1,hour_local:8,timezone:'America/Chicago',metrics:[],recipients:[],enabled:true}).select('*').single();
 return unwrap(data,error);
}

export async function setReportingScheduleEnabled(scheduleId:string,enabled:boolean){
 const {data,error}=await client().from('reporting_schedules').update({enabled}).eq('id',scheduleId).select('*').single();
 return unwrap(data,error);
}

export async function listReportingRuns(scheduleIds:string[]){
 if(!scheduleIds.length)return [];
 const {data,error}=await client().from('reporting_runs').select('*').in('schedule_id',scheduleIds).order('created_at',{ascending:false}).limit(50);
 return unwrap(data??[],error);
}

export async function getEnterpriseControlPlaneSnapshot(businessId:string,days=30){
 const {data,error}=await client().rpc('enterprise_control_plane_snapshot',{p_business_id:businessId,p_window_days:days});
 return unwrap(data as Record<string,unknown>|null,error);
}

export async function listEnterpriseNetworks(businessId:string){
 const {data,error}=await client().rpc('enterprise_list_owned_networks',{p_business_id:businessId});
 return unwrap(data??[],error);
}

export async function listEnterprisePartnerBusinesses(businessId:string){
 const {data,error}=await client().rpc('enterprise_list_partner_businesses',{p_business_id:businessId});
 return unwrap(data??[],error);
}

export async function createEnterpriseNetwork(name:string){
 const {data,error}=await client().rpc('create_enterprise_partner_network',{p_name:name});
 return unwrap(data,error);
}

export async function updateEnterpriseNetwork(networkId:string,name:string,enabled:boolean){
 const {data,error}=await client().rpc('enterprise_update_network',{p_network_id:networkId,p_name:name,p_enabled:enabled});
 return unwrap(data,error);
}

export async function listEnterpriseNetworkMembers(networkId:string){
 const {data,error}=await client().rpc('enterprise_list_network_members',{p_network_id:networkId});
 return unwrap(data??[],error);
}

export async function inviteEnterprisePartner(networkId:string,partnerBusinessId:string){
 const {data,error}=await client().rpc('invite_enterprise_partner',{p_network_id:networkId,p_partner_business_id:partnerBusinessId});
 return unwrap(data,error);
}

export async function setEnterprisePartnerStatus(membershipId:string,status:string){
 const {data,error}=await client().rpc('set_enterprise_partner_status',{p_membership_id:membershipId,p_status:status});
 return unwrap(data,error);
}

export async function getLocationTrustQuality(locationId:string){
 const {data,error}=await client().rpc('get_location_trust_quality',{p_location_id:locationId});
 return unwrap(data as Record<string,unknown>|null,error);
}

export async function getLocationTrustConflicts(locationId:string){
 const {data,error}=await client().rpc('get_location_trust_conflicts',{p_location_id:locationId});
 return unwrap(data as Record<string,unknown>|null,error);
}

export async function buildGovernanceReport(businessId:string,days=30){
 const {start,end}=window(days);
 const {data,error}=await client().rpc('reporting_build_payload',{p_scope_type:'business',p_scope_id:businessId,p_start:start,p_end:end});
 return unwrap(data as Record<string,unknown>|null,error);
}
