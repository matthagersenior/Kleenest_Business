import { getSupabaseClient } from '@/lib/supabase';

export type BusinessProgressionEngagementSnapshot={
  business_id:string;
  discoveries:number;
  discovered_locations:number;
  xp_at_locations:number;
  contributors:number;
  active_campaigns:number;
  recent_actions:Array<{action:string;xp:number;location_id:string|null;created_at:string}>;
};

export async function getBusinessProgressionEngagementSnapshot(businessId:string):Promise<BusinessProgressionEngagementSnapshot>{
  const{data,error}=await getSupabaseClient().rpc('business_progression_engagement_snapshot',{p_business_id:businessId});
  if(error)throw new Error(error.message);
  return(data||{business_id:businessId,discoveries:0,discovered_locations:0,xp_at_locations:0,contributors:0,active_campaigns:0,recent_actions:[]}) as BusinessProgressionEngagementSnapshot;
}
