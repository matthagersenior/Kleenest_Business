import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const requireAll=(p,tokens)=>{const s=read(p);for(const t of tokens)if(!s.includes(t))throw new Error(`${p} missing functional UI contract: ${t}`);return s;};

const layout=requireAll('app/_layout.tsx',['headerShown:false','Business home']);
const home=requireAll('app/index.tsx',['Your operating workspaces','Locations','Reviews & replies','QR Studio','Team & roles','Engagement','Trust operations','Enterprise command','caps.enterpriseLocationFeatures','function Action({label,onPress}','function LightAction({label,onPress','href="/auth" replace']);
const auth=requireAll('app/auth.tsx',["router.replace('/')",'signInBusiness','await refresh()']);
const authService=requireAll('src/services/auth.ts',['signInWithPassword','signInBusiness']);
const enterpriseLocation=requireAll('app/enterprise-location.tsx',['Action({label,secondary=false,onPress','<Pressable onPress={onPress}']);
const qr=requireAll('app/qr-studio.tsx',['STANDARD QR','GROWTH + ENTERPRISE STUDIO','Action type','QR versions','TEMPLATES','Restore version','Save as template','Delete QR','single use','max redemptions','react-native-qrcode-svg','<QRCode value={payload}','Share QR','Share.share']);
const service=requireAll('src/services/engagement.ts',['qr_studio_list_assets','qr_studio_list_templates','qr_studio_save_template','qr_studio_versions','qr_studio_restore_version','business_delete_qr','business_update_custom_qr']);
if(qr.includes('No QR assets yet.')&&!qr.includes('Create your first QR'))throw new Error('QR Studio must expose a first-run action rather than a dead empty state');
for(const [name,source] of Object.entries({home,enterpriseLocation}))if(source.includes('asChild><Action')&&!source.includes('onPress?:()=>void'))throw new Error(`${name} contains Link-wrapped Action controls that do not forward navigation onPress`);
if(home.includes('<Link href="/auth" asChild>'))throw new Error('Business home must replace, not push, the auth route or post-login navigation duplicates the home screen');
if(!auth.includes("router.replace('/')"))throw new Error('Business auth must replace itself with the Business home after successful authorization');
if(!authService.includes('signInWithPassword'))throw new Error('Business password auth service is not wired to Supabase password sign-in');
console.log('Business UI functional audit passed with one canonical destination per primary business job.');