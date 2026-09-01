import { getSupabaseClient } from '@/lib/supabase';

const client=()=>getSupabaseClient();
function unwrap<T>(data:T|null,error:{message:string}|null):T{if(error)throw new Error(error.message);if(data==null)throw new Error('Business prevention service returned no data.');return data;}

export async function getPreventiveWorkOrders(businessId:string,days=90){const{data,error}=await client().rpc('business_restroom_preventive_work_orders',{p_business_id:businessId,p_days:days});return unwrap(data as Record<string,unknown>|null,error);}
export async function getPreventionRecommendations(businessId:string,days=90){const{data,error}=await client().rpc('business_restroom_prevention_recommendations',{p_business_id:businessId,p_days:days});return unwrap(data as Record<string,unknown>|null,error);}
export async function getPreventiveEffectiveness(businessId:string,days=180){const{data,error}=await client().rpc('business_restroom_preventive_effectiveness',{p_business_id:businessId,p_days:days});return unwrap(data as Record<string,unknown>|null,error);}
export async function getPreventiveExecutionPerformance(businessId:string,days=90){const{data,error}=await client().rpc('business_restroom_preventive_execution_performance',{p_business_id:businessId,p_days:days});return unwrap(data as Record<string,unknown>|null,error);}
export async function managePreventiveWorkOrder(businessId:string,workOrderId:string,action:'assign'|'claim'|'start'|'complete'|'dismiss'|'reopen',options:{assignedTo?:string|null;notes?:string|null;proofMediaId?:string|null}={}){const{data,error}=await client().rpc('business_manage_restroom_preventive_work_order',{p_business_id:businessId,p_work_order_id:workOrderId,p_action:action,p_assigned_to:options.assignedTo??null,p_notes:options.notes??null,p_proof_media_id:options.proofMediaId??null});return unwrap(data as Record<string,unknown>|null,error);}
