import fs from 'node:fs';
const failures=[];
const required=['app/advertising.tsx','src/services/advertising.ts','app/_layout.tsx','app/index.tsx'];
for(const file of required)if(!fs.existsSync(file))failures.push(`Missing advertising surface: ${file}`);
if(!failures.length){
 const page=fs.readFileSync(required[0],'utf8'),service=fs.readFileSync(required[1],'utf8'),layout=fs.readFileSync(required[2],'utf8'),home=fs.readFileSync(required[3],'utf8');
 for(const token of ['CONTEXTUAL TARGETING','CONSUMER PREVIEW','Submit for activation','AdMob/network ads'])if(!page.includes(token))failures.push(`Advertise UI missing: ${token}`);
 for(const token of ['business_sponsorship_snapshot','business_upsert_sponsored_campaign','business_withdraw_sponsored_campaign'])if(!service.includes(token))failures.push(`Advertising service missing RPC: ${token}`);
 if(!layout.includes('name="advertising"'))failures.push('Advertising route is not registered.');
 if(!home.includes('title="Sponsored Ads"'))failures.push('Sponsored Ads must be discoverable from Business home.');
 if(!home.includes('title="Campaigns & Promotions"'))failures.push('Campaigns & Promotions must be the canonical engagement label.');
 if(home.indexOf('title="Sponsored Ads"')>home.indexOf('title="Campaigns & Promotions"'))failures.push('Sponsored Ads must appear before Campaigns & Promotions.');
}

const ota=fs.readFileSync('.github/workflows/ota-update.yml','utf8');
const config=fs.readFileSync('app.config.ts','utf8');
if(ota.includes('business-production'))failures.push('Standalone Business repo must not publish to the authoritative business-production OTA channel.');
if(!ota.includes('business-legacy-preview'))failures.push('Standalone Business OTA must be isolated to business-legacy-preview.');
if(!config.includes("|| 'business-legacy-preview'"))failures.push('Standalone Business default OTA channel must be isolated from Production.');

if(failures.length){console.error('Business advertising audit failed:');for(const f of failures)console.error(`- ${f}`);process.exit(1)}
console.log('Business advertising audit passed.');
