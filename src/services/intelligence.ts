import { getSupabaseClient } from '@/lib/supabase';

function client() { return getSupabaseClient(); }
function unwrap<T>(data:T|null,error:{message:string}|null):T { if(error) throw new Error(error.message); if(data==null) throw new Error('Canonical intelligence service returned no data.'); return data; }
function windowArgs(businessId:string,days=30){const end=new Date();const start=new Date(end.getTime()-days*86_400_000);return{p_business_id:businessId,p_start:start.toISOString(),p_end:end.toISOString()};}

export async function getGrowthIntelligenceBundle(businessId:string,days=30){
  const args=windowArgs(businessId,days);
  const [authority,cockpit,growth,assets,benchmarks,roi,locations,operations,recommendations,reverification,history]=await Promise.all([
    client().rpc('get_business_intelligence_authority_bundle',args),
    client().rpc('business_growth_cockpit',{p_business_id:businessId,p_window_days:days}),
    client().rpc('business_growth_analytics',args),
    client().rpc('business_growth_asset_performance',args),
    client().rpc('business_benchmark_analytics',args),
    client().rpc('business_roi_analytics',args),
    client().rpc('business_location_intelligence',args),
    client().rpc('business_operations_inventory',{p_business_id:businessId}),
    client().rpc('business_restroom_prevention_recommendations',{p_business_id:businessId,p_days:Math.max(days,90)}),
    client().rpc('business_reverification_queue',{p_business_id:businessId}),
    client().rpc('business_growth_optimization_history',{p_business_id:businessId,p_limit:50}),
  ]);
  for(const response of [authority,cockpit,growth,assets,benchmarks,roi,locations,operations,recommendations,reverification,history]) if(response.error) throw new Error(response.error.message);
  return {authority:authority.data,cockpit:cockpit.data,growth:growth.data,assets:assets.data,benchmarks:benchmarks.data,roi:roi.data,locations:locations.data,operations:operations.data,recommendations:recommendations.data,reverification:reverification.data,history:history.data};
}

export async function buildBusinessReportPayload(businessId:string,days=30){
  const end=new Date(); const start=new Date(end.getTime()-days*86_400_000);
  const {data,error}=await client().rpc('reporting_build_payload',{p_scope_type:'business',p_scope_id:businessId,p_start:start.toISOString(),p_end:end.toISOString()});
  return unwrap(data as Record<string,unknown>|null,error);
}
