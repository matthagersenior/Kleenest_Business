import { getSupabaseClient } from '@/lib/supabase';

const client=()=>getSupabaseClient();
async function rpc(name:string,args:Record<string,unknown>={}){const{data,error}=await client().rpc(name,args);if(error)throw error;return data;}

export type SponsoredPlacement={placement_code:string;surface:string;slot:string;format:string;frequency_cap_daily:number};
export type BusinessSponsoredCampaign={id:string;business_id:string;name:string;sponsor_name:string;headline:string;body:string|null;cta_label:string;destination_url:string;status:string;submission_status:string;targeting:Record<string,unknown>;placements:string[];impressions:number;clicks:number;dismissals:number;review_note?:string|null};
export async function getBusinessSponsorshipSnapshot(businessId:string){const data:any=await rpc('business_sponsorship_snapshot',{p_business_id:businessId});return{placements:Array.isArray(data?.placements)?data.placements:[],campaigns:Array.isArray(data?.campaigns)?data.campaigns:[],rules:data?.rules||{}};}
export function saveBusinessSponsoredCampaign(businessId:string,input:{id?:string|null;name:string;headline:string;body?:string;ctaLabel?:string;destinationUrl:string;targeting?:Record<string,unknown>;frequencyCapDaily?:number;impressionCapTotal?:number|null;placementCodes:string[];submit?:boolean}){return rpc('business_upsert_sponsored_campaign',{p_business_id:businessId,p_campaign_id:input.id??null,p_name:input.name,p_headline:input.headline,p_body:input.body??'',p_cta_label:input.ctaLabel??'Learn more',p_destination_url:input.destinationUrl,p_targeting:input.targeting??{},p_frequency_cap_daily:input.frequencyCapDaily??2,p_impression_cap_total:input.impressionCapTotal??null,p_placement_codes:input.placementCodes,p_submit:input.submit===true});}
export function withdrawBusinessSponsoredCampaign(businessId:string,campaignId:string){return rpc('business_withdraw_sponsored_campaign',{p_business_id:businessId,p_campaign_id:campaignId});}
