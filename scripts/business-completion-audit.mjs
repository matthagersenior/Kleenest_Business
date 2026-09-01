import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const requireAll=(p,tokens)=>{const s=read(p);for(const t of tokens)if(!s.includes(t))throw new Error(`${p} missing Business completion contract: ${t}`);return s;};

const layout=requireAll('app/_layout.tsx',['assistant','qr-studio','notifications','intelligence','enterprise']);
const home=requireAll('app/index.tsx',['Business CRUD','QR Studio','Custom Notifications','Kleenest AI','Advanced Intelligence','optional Fleet handoff']);
const locations=requireAll('app/locations.tsx',['listBusinessLocations','createBusinessLocation','updateBusinessLocation']);
const reviews=requireAll('src/services/business.ts',['business_review_detail','business_reply_review']);
const reviewEvidence=requireAll('src/services/reviews.ts',['mobile_review_evidence','mobile_location_review_evidence','mobile_review_photos_for_reviews']);
const qr=requireAll('app/qr-studio.tsx',['getCoreEngagementBundle','manageQr','setQrActive','setQrCustomization','createQrEngagementProgram']);
const comms=requireAll('app/notifications.tsx',['business_custom','sendBusinessNotification','runBusinessAi','notification_copy']);
const intel=requireAll('app/intelligence.tsx',['getGrowthIntelligenceBundle','Advanced Intelligence','Ask Kleenest AI']);
const prevention=requireAll('app/prevention.tsx',['execution → verification','Fleet handoff attached','Promise.allSettled']);
const governance=requireAll('app/governance.tsx',['DataSummary','runDueReportingSchedules','buildGovernanceReport']);
const enterprise=requireAll('app/enterprise.tsx',['DataSummary','createEnterpriseNetwork','recordEnterpriseCampaignOutcome']);
const ai=requireAll('src/services/ai.ts',['functions.invoke','ai-assist','Authorization','business_growth','notification_copy']);
const tiers=requireAll('src/domain/businessTiers.ts',['advancedEngagement:growth','intelligence:growth','reporting:growth','enterpriseNetworks:enterprise']);
const intelligenceService=requireAll('src/services/intelligence.ts',['Promise.allSettled','get_business_intelligence_authority_bundle','business_growth_cockpit','business_restroom_prevention_recommendations']);

for(const [name,source] of Object.entries({layout,home,locations,reviews,reviewEvidence,qr,comms,intel,prevention,governance,enterprise,ai,tiers,intelligenceService})){
 if(source.includes('JSON.stringify(value??{},null,2)'))throw new Error(`${name} reintroduced raw JSON payload presentation`);
}
console.log('Business completion convergence audit passed.');
