import { useCallback,useEffect,useState } from 'react';
import { ActivityIndicator,Pressable,RefreshControl,ScrollView,Text,TextInput,View } from 'react-native';
import { DataSummary } from '@/components/DataSummary';
import { createPartnerProgram,createPartnership,deletePartnerProgram,deletePartnership,getBusinessParityBundle,listPartnerPrograms,listPartnerships,updatePartnerProgram,updatePartnership,type BusinessParityBundle } from '@/services/parity';
import { useBusinessWorkspace } from '@/state/businessWorkspace';

type Row=Record<string,unknown>;
const rows=(v:unknown):Row[]=>Array.isArray(v)?v.filter(x=>Boolean(x&&typeof x==='object')) as Row[]:[];
const idOf=(r:Row)=>String(r.id??r.partner_program_id??'');
const label=(r:Row)=>String(r.name??r.title??r.program_name??'Partner program');

export default function BusinessCapabilities(){
 const{workspace}=useBusinessWorkspace();
 const[bundle,setBundle]=useState<BusinessParityBundle|null>(null),[programs,setPrograms]=useState<Row[]>([]),[partnerships,setPartnerships]=useState<Row[]>([]);
 const[name,setName]=useState('Kleenest partner program'),[partnershipName,setPartnershipName]=useState('Kleenest partner relationship');
 const[loading,setLoading]=useState(true),[refreshing,setRefreshing]=useState(false),[busy,setBusy]=useState<string|null>(null),[error,setError]=useState<string|null>(null);
 const load=useCallback(async()=>{if(!workspace)throw new Error('Business workspace required.');const[b,p,s]=await Promise.all([getBusinessParityBundle(workspace.business_id,30),listPartnerPrograms(),listPartnerships(workspace.business_id)]);setBundle(b);setPrograms(rows(p));setPartnerships(rows(s));},[workspace]);
 useEffect(()=>{load().catch(c=>setError(c instanceof Error?c.message:String(c))).finally(()=>setLoading(false));},[load]);
 async function refresh(){setRefreshing(true);setError(null);try{await load();}catch(c){setError(c instanceof Error?c.message:String(c));}finally{setRefreshing(false)}}
 async function run(key:string,fn:()=>Promise<unknown>){setBusy(key);setError(null);try{await fn();await refresh();}catch(c){setError(c instanceof Error?c.message:String(c));}finally{setBusy(null)}}
 if(loading)return <View style={{flex:1,justifyContent:'center'}}><ActivityIndicator size="large"/></View>;
 if(!workspace)return <View style={{padding:24}}><Text>Business workspace required.</Text></View>;
 return <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh}/>} contentContainerStyle={{padding:16,gap:16,paddingBottom:60}}>
  {error?<View style={warn}><Text style={{color:'#922'}} selectable>{error}</Text></View>:null}
  <View style={hero}><Text style={eyebrow}>SUPABASE → BUSINESS PARITY</Text><Text style={heroTitle}>Capability control plane</Text><Text style={heroText}>Live canonical analytics, funnels, partner programs, progression, rankings, remediation and reliability. Every section below is backed by Supabase authority rather than UI-derived numbers.</Text></View>
  {bundle?.errors.length?<View style={warn}><Text style={{fontWeight:'900'}}>Partial capability errors</Text>{bundle.errors.map(e=><Text key={e} selectable style={{color:'#7d4f12'}}>• {e}</Text>)}</View>:null}
  <Section title="Analytics fabric" subtitle="Visitors, reviews, promotions, campaigns, events, QR, media, amenities, occupancy, rewards and summary"><DataSummary value={bundle?.analytics}/></Section>
  <Section title="Attribution & growth funnels" subtitle="Canonical attribution, engagement and recommended growth actions"><DataSummary value={bundle?.funnels}/></Section>
  <Section title="Community economy" subtitle="Progression engagement and Business/cross-tier rankings"><DataSummary value={{progression:bundle?.progression,leaderboards:bundle?.leaderboards}}/></Section>
  <Section title="Trust & remediation operations" subtitle="Reverification, remediation, reliability and remediation performance"><DataSummary value={bundle?.operations}/></Section>
  <Section title="Partner intelligence" subtitle="Partner analytics and preferred-location network state"><DataSummary value={bundle?.partner}/></Section>

  <Section title="Partner program management" subtitle="Create, enable/disable and remove canonical partner programs">
   <View style={card}><TextInput value={name} onChangeText={setName} style={input}/><Action disabled={Boolean(busy)||!name.trim()} label={busy==='program:create'?'Creating…':'Create partner program'} onPress={()=>run('program:create',()=>createPartnerProgram(workspace.business_id,name.trim()))}/></View>
   {programs.length?programs.map((p,i)=>{const id=idOf(p),enabled=p.enabled!==false;return <View key={id||String(i)} style={card}><Text style={heading}>{label(p)}</Text><Text style={muted}>{enabled?'Enabled':'Disabled'} · {String(p.preferred_access??false)==='true'?'preferred access':'standard access'}</Text><View style={row}><Action secondary label={enabled?'Disable':'Enable'} onPress={()=>run(`program:${id}`,()=>updatePartnerProgram(workspace.business_id,id,label(p),!enabled))}/><Action secondary label="Delete" onPress={()=>run(`program:delete:${id}`,()=>deletePartnerProgram(workspace.business_id,id))}/></View></View>}):<Text style={muted}>No partner programs yet.</Text>}
  </Section>

  <Section title="Partnerships" subtitle="Business-to-business partner relationships that feed preferred access and network intelligence">
   <View style={card}><TextInput value={partnershipName} onChangeText={setPartnershipName} style={input}/><Action disabled={Boolean(busy)||!partnershipName.trim()} label="Create partnership" onPress={()=>run('partnership:create',()=>createPartnership(workspace.business_id,partnershipName.trim()))}/></View>
   {partnerships.length?partnerships.map((p,i)=>{const id=idOf(p),enabled=p.enabled!==false;return <View key={id||String(i)} style={card}><Text style={heading}>{label(p)}</Text><Text style={muted}>{enabled?'Enabled':'Disabled'} · {String(p.custom_perk??'No custom perk')}</Text><View style={row}>{id?<Action secondary label={enabled?'Disable':'Enable'} onPress={()=>run(`partnership:${id}`,()=>updatePartnership(workspace.business_id,id,{name:label(p),enabled:!enabled,preferredAccess:Boolean(p.preferred_access),matchDiscountBonus:Number(p.match_discount_bonus??0),customPerk:p.custom_perk==null?null:String(p.custom_perk)}))}/>:null}{id?<Action secondary label="Delete" onPress={()=>run(`partnership:delete:${id}`,()=>deletePartnership(workspace.business_id,id))}/>:null}</View></View>}):<Text style={muted}>No direct partnerships yet.</Text>}
  </Section>
 </ScrollView>;
}

function Section({title,subtitle,children}:{title:string;subtitle:string;children:React.ReactNode}){return <View style={{gap:9}}><Text style={{fontSize:21,fontWeight:'900'}}>{title}</Text><Text style={muted}>{subtitle}</Text><View style={card}>{children}</View></View>}
function Action({label,onPress,disabled,secondary}:{label:string;onPress:()=>void|Promise<void>;disabled?:boolean;secondary?:boolean}){return <Pressable disabled={disabled} onPress={onPress} style={{alignSelf:'flex-start',borderRadius:999,paddingHorizontal:12,paddingVertical:8,backgroundColor:secondary?'#edf3ef':'#173f2d',opacity:disabled?.5:1}}><Text style={{fontWeight:'900',color:secondary?'#244d39':'white'}}>{label}</Text></Pressable>}
const hero={backgroundColor:'#132b21' as const,borderRadius:20,padding:18,gap:7},eyebrow={color:'#bde4cf',fontWeight:'900' as const,letterSpacing:1},heroTitle={color:'white',fontSize:25,fontWeight:'900' as const},heroText={color:'#dce8e1',lineHeight:20 as const},card={backgroundColor:'white' as const,borderRadius:16,padding:14,gap:9},warn={backgroundColor:'#fff6df' as const,borderRadius:16,padding:13,gap:5},input={borderWidth:1,borderColor:'#dce4df',borderRadius:12,padding:11},heading={fontSize:16,fontWeight:'900' as const},muted={color:'#66766e',lineHeight:19 as const},row={flexDirection:'row' as const,flexWrap:'wrap' as const,gap:8};
