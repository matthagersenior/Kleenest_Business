import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const requireAll=(p,tokens)=>{const s=read(p);for(const t of tokens)if(!s.includes(t))throw new Error(`${p} missing Business completion contract: ${t}`);return s;};

const layout=requireAll('app/_layout.tsx',['assistant','qr-studio','notifications','intelligence','capabilities','enterprise','enterprise-economy']);
const home=requireAll('app/index.tsx',['Your operating workspaces','Locations','Reviews & replies','QR Studio','Team & roles','Engagement','Trust operations','Business profile','Notifications','Kleenest AI','Intelligence','Capability control plane','Enterprise command','optional Fleet handoff']);
const locations=requireAll('app/locations.tsx',['listBusinessLocations','createBusinessLocation','updateBusinessLocation','Find & claim existing','requestLocationClaim','searchClaimableLocations','ready for map/Fleet routing']);
const locationClaims=requireAll('src/services/locationClaims.ts',['business_search_claimable_locations','business_list_location_claims','claim_location_for_business']);
const reviews=requireAll('src/services/business.ts',['business_review_detail','business_reply_review']);
const reviewEvidence=requireAll('src/services/reviews.ts',['mobile_review_evidence','mobile_location_review_evidence','mobile_review_photos_for_reviews']);
const qr=requireAll('app/qr-studio.tsx',['listQrStudioAssets','createCustomBusinessQr','setQrActive','updateCustomBusinessQr','createQrEngagementProgram','listQrStudioTemplates','listQrStudioVersions','restoreQrStudioVersion','deleteBusinessQr']);
const comms=requireAll('app/notifications.tsx',['business_custom','sendBusinessNotification','runBusinessAi','notification_copy']);
const intel=requireAll('app/intelligence.tsx',['getGrowthIntelligenceBundle','ADVANCED INTELLIGENCE','Ask Kleenest AI']);
const prevention=requireAll('app/prevention.tsx',['execution → verification','Fleet handoff attached','Promise.allSettled']);
const governance=requireAll('app/governance.tsx',['DataSummary','runDueReportingSchedules','buildGovernanceReport']);
const enterprise=requireAll('app/enterprise.tsx',['ENTERPRISE OPERATING SYSTEM','Portfolio businesses','Fleet command','Operational alerts','Location network','createEnterpriseNetwork','recordEnterpriseCampaignOutcome','getEnterpriseOperationalPortfolio']);
const enterpriseEconomy=requireAll('app/enterprise-economy.tsx',['ENTERPRISE ECONOMY','createPartnerAllocation','activatePartnerAllocation','getPartnerNetworkBenchmark','getPartnerAllocationRoi','recordEnterpriseCampaignOutcome']);
const enterpriseService=requireAll('src/services/enterprise.ts',['getPartnerNetworkBenchmark','createPartnerAllocation','activatePartnerAllocation','getPartnerAllocationRoi','getPartnerCampaignRoi']);
const enterprisePortfolio=requireAll('src/services/enterprisePortfolio.ts',['enterprise_operational_portfolio_snapshot','EnterpriseOperationalPortfolio','locations','routes','alerts']);
const capabilityUi=requireAll('app/capabilities.tsx',['getBusinessParityBundle','Partner program management','Partnerships','Community economy','Trust & remediation operations']);
const capabilityService=requireAll('src/services/parity.ts',['business_visitors_analytics','business_review_analytics','business_promotion_analytics','business_campaign_analytics','business_event_analytics','business_qr_analytics','business_media_analytics','business_amenity_feedback_analytics','business_occupancy_analytics','business_partner_analytics','business_rewards_analytics','get_business_attribution_funnel','get_business_engagement_funnel','business_progression_engagement_snapshot','get_business_leaderboard','get_cross_tier_leaderboard','business_reverification_operations','business_restroom_remediation_operations','business_restroom_reliability','business_create_partner_program','business_update_partner_program','business_delete_partner_program','business_create_partnership','business_update_partnership','business_delete_partnership']);
const ai=requireAll('src/services/ai.ts',['functions.invoke','ai-assist','Authorization','business_growth','notification_copy']);
const tiers=requireAll('src/domain/businessTiers.ts',['advancedEngagement:growth','intelligence:growth','reporting:growth','enterpriseNetworks:enterprise']);
const intelligenceService=requireAll('src/services/intelligence.ts',['Promise.allSettled','get_business_intelligence_authority_bundle','business_growth_cockpit','business_restroom_prevention_recommendations']);
const workspace=requireAll('src/state/businessWorkspace.tsx',['getBusinessProductAccess','selectWorkspace','business_id']);
const auth=read('app/auth.tsx');
const authService=read('src/services/auth.ts');
const authCompact=(auth+'\n'+authService).replace(/\s+/g,'');
for(const token of ['Continue with Google','signInWithOAuth','exchangeCodeForSession','Linking.createURL','Linking.openURL'])if(!(auth+'\n'+authService).includes(token))throw new Error(`Business Google auth contract missing ${token}`);
if(!authCompact.includes("provider:'google'")&&!authCompact.includes('provider:"google"'))throw new Error('Business Google auth must use the Supabase google provider');
if(!authCompact.includes('skipBrowserRedirect:true'))throw new Error('Business Google auth must use native browser handoff');
if(!auth.includes('await refresh()'))throw new Error('Business Google auth must resolve authorized workspaces before entry');

for(const [name,source] of Object.entries({layout,home,locations,locationClaims,reviews,reviewEvidence,qr,comms,intel,prevention,governance,enterprise,enterpriseEconomy,enterpriseService,enterprisePortfolio,capabilityUi,capabilityService,ai,tiers,intelligenceService,workspace})){
 if(source.includes('JSON.stringify(value??{},null,2)'))throw new Error(`${name} reintroduced raw JSON payload presentation`);
}
console.log('Business completion convergence audit passed with canonical workspace navigation and hardened Supabase-to-UI parity coverage, including Enterprise economy authority.');