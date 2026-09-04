import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const requireAll=(p,tokens)=>{const s=read(p);for(const t of tokens)if(!s.includes(t))throw new Error(`${p} missing functional UI contract: ${t}`);return s;};

const layout=requireAll('app/_layout.tsx',['headerShown:false','Business home']);
const home=requireAll('app/index.tsx',['Quick actions','Open QR Studio','Manage locations','Reviews & replies','Team & roles','Growth workspace','Enterprise workspace']);
const qr=requireAll('app/qr-studio.tsx',['STANDARD QR','GROWTH + ENTERPRISE STUDIO','Action type','QR versions','Templates','Restore version','Save as template','Delete QR','single use','max redemptions']);
const service=requireAll('src/services/engagement.ts',['qr_studio_list_assets','qr_studio_list_templates','qr_studio_save_template','qr_studio_versions','qr_studio_restore_version','business_delete_qr','business_update_custom_qr']);
if(qr.includes('No QR assets yet.')&&!qr.includes('Create your first QR'))throw new Error('QR Studio must expose a first-run action rather than a dead empty state');
console.log('Business UI functional audit passed.');
