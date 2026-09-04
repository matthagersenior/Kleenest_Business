import { Link } from 'expo-router';
import { useCallback,useEffect,useMemo,useState } from 'react';
import { ActivityIndicator,Pressable,RefreshControl,ScrollView,Text,View } from 'react-native';
import { getBusinessDashboardSummary,listBusinessLocations,type BusinessLocation } from '@/services/business';
import { getCoreEngagementBundle } from '@/services/engagement';
import { getGrowthIntelligenceBundle } from '@/services/intelligence';
import { getBusinessTierCapabilities } from '@/domain/businessTiers';
import { useBusinessWorkspace } from '@/state/businessWorkspace';

type Row=Record<string,unknown>;
function rows(value:unknown):Row[]{if(Array.isArray(value))return value.filter(v=>v&&typeof v==='object') as Row[];if(value&&typeof value==='object'){const source=value as Row;for(const key of['rows','items','locations','detail','qr_codes','qrs'])if(Array.isArray(source[key]))return (source[key] as unknown[]).filter(v=>v&&typeof v==='object') as Row[];}return[];}
function number(value:unknown,fallback=0){const parsed=Number(value);return Number.isFinite(parsed)?parsed:fallback;}
function scalar(value:unknown){return typeof value==='string'&&value.trim()?value.trim():null;}
function locationId(row:Row){return String(row.location_id??row.id??'');}
function addressOf(location:BusinessLocation){return [location.address,location.city,location.state,location.postal_code].filter(Boolean).join(', ')||'Address unavailable';}
function pct(value:unknown){const n=number(value,NaN);if(!Number.isFinite(n))return '—';return `${n.toFixed(n%1===0?0:1)}%`;}

export default function EnterpriseLocationScreen(){
 const{workspace,access,entitlement}=useBusinessWorkspace();
 const caps=getBusinessTierCapabilities(access,entitlement);
 const[locations,setLocations]=useState<BusinessLocation[]>([]);
 const[intelligence,setIntelligence]=useState<Awaited<ReturnType<typeof getGrowthIntelligenceBundle>>|null>(null);
 const[dashboard,setDashboard]=useState<Row|null>(null);
 const[engagement,setEngagement]=useState<Awaited<ReturnType<typeof getCoreEngagementBundle>>|null>(null);
 const[loading,setLoading]=useState(true),[refreshing,setRefreshing]=useState(false),[errors,setErrors]=useState<string[]>([]);
 const allowed=caps.enterpriseLocationFeatures;
 const load=useCallback(async()=>{
  if(!workspace||!allowed)return;
  const settled=await Promise.allSettled([
   listBusinessLocations(workspace.business_id),
   getGrowthIntelligenceBundle(workspace.business_id),
   getBusinessDashboardSummary(workspace.business_id),
   getCoreEngagementBundle(workspace.business_id),
  ]);
  const nextErrors:string[]=[];
  const value=<T,>(index:number,fallback:T):T=>{const result=settled[index];if(result.status==='fulfilled')return result.value as T;nextErrors.push(result.reason instanceof Error?result.reason.message:String(result.reason));return fallback;};
  setLocations(value(0,[] as BusinessLocation[]));
  setIntelligence(value(1,null as Awaited<ReturnType<typeof getGrowthIntelligenceBundle>>|null));
  setDashboard(value(2,null as Row|null));
  setEngagement(value(3,null as Awaited<ReturnType<typeof getCoreEngagementBundle>>|null));
  setErrors(nextErrors);
 },[workspace,allowed]);
 useEffect(()=>{setLoading(true);load().finally(()=>setLoading(false));},[load]);
 async function refresh(){setRefreshing(true);try{await load();}finally{setRefreshing(false)}}
 const intelligenceRows=useMemo(()=>rows(intelligence?.locations.data),[intelligence]);
 const intelligenceByLocation=useMemo(()=>new Map(intelligenceRows.map(row=>[locationId(row),row])),[intelligenceRows]);
 const qrRows=useMemo(()=>rows(engagement?.qr),[engagement]);
 const activeQr=qrRows.filter(row=>row.active!==false).length;
 const summary=dashboard&&typeof dashboard==='object'?(dashboard.summary&&typeof dashboard.summary==='object'?dashboard.summary as Row:dashboard):{} as Row;
 if(!allowed)return <View style={{flex:1,padding:24,justifyContent:'center',gap:10}}><Text style={{fontSize:24,fontWeight:'900',color:'#173024'}}>Enterprise Location</Text><Text style={muted}>Enterprise Location features are included with Business Growth and Enterprise. Standard workspaces can upgrade without receiving Enterprise network authority.</Text></View>;
 if(loading)return <View style={{flex:1,justifyContent:'center'}}><ActivityIndicator size="large"/></View>;
 const limit=access?.location_limit??null;
 const remaining=limit==null?null:Math.max(0,limit-locations.filter(location=>location.is_active??location.active??true).length);
 return <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh}/>} contentContainerStyle={{padding:16,gap:16,paddingBottom:64}}>
  <View style={hero}><Text style={{color:'#bde4cf',fontWeight:'900',letterSpacing:1}}>ENTERPRISE LOCATION · GROWTH+</Text><Text style={{color:'white',fontSize:26,fontWeight:'900'}}>{workspace?.business_name??workspace?.name??'Business'} location portfolio</Text><Text style={{color:'#dce8e1',lineHeight:20}}>Operate up to five Growth locations or an unlimited Enterprise portfolio from the same canonical location, QR, intelligence, trust and remediation data.</Text></View>
  {errors.length?<View style={warning}><Text style={{fontWeight:'900',color:'#744f14'}}>Some live location services are temporarily degraded</Text><Text selectable style={{color:'#775f34',lineHeight:19}}>{errors.join(' · ')}</Text></View>:null}
  <View style={metrics}><Metric label="Managed locations" value={locations.length}/><Metric label="Location intelligence" value={intelligenceRows.length}/><Metric label="Active QR assets" value={activeQr}/><Metric label="Remaining Growth slots" value={remaining==null?'∞':remaining}/></View>

  <Section title="Location portfolio" subtitle="Every card resolves to the canonical Business location used by Consumer discovery, QR, trust and operational intelligence.">
   {locations.length?locations.map(location=>{const intel=intelligenceByLocation.get(String(location.id));const active=Boolean(location.is_active??location.active??true);return <View key={location.id} style={card}>
    <View style={spread}><View style={{flex:1,gap:3}}><Text style={heading}>{location.name}</Text><Text style={muted}>{addressOf(location)}</Text></View><Badge text={active?'active':'inactive'}/></View>
    <View style={facts}><Fact label="Intelligence score" value={intel?number(intel.intelligence_score).toFixed(1):'—'}/><Fact label="Cleanliness" value={intel?pct(intel.cleanliness_pct):'—'}/><Fact label="Demand signal" value={intel?number(intel.demand_signal).toLocaleString():'—'}/><Fact label="Verifications" value={intel?number(intel.verification_count).toLocaleString():'—'}/><Fact label="Check-ins" value={intel?number(intel.check_ins).toLocaleString():'—'}/><Fact label="Reviews" value={intel?number(intel.reviews).toLocaleString():'—'}/></View>
    <View style={actions}><Link href="/locations" asChild><Action label="Manage location"/></Link><Link href="/qr-studio" asChild><Action label="QR Studio" secondary/></Link><Link href="/reviews" asChild><Action label="Reviews" secondary/></Link></View>
   </View>}):<View style={card}><Text style={heading}>No managed locations yet</Text><Text style={muted}>Claim an existing canonical location or create a genuinely new one. Growth can manage up to five locations.</Text><Link href="/locations" asChild><Action label="Find or add a location"/></Link></View>}
  </Section>

  <Section title="Location intelligence" subtitle="Cross-location demand, cleanliness, verification and engagement signals are the Enterprise Location view included with Growth.">
   <View style={card}><Fact label="30-day searches" value={number(summary.searches??summary.search_count).toLocaleString()}/><Fact label="30-day location views" value={number(summary.location_views??summary.views).toLocaleString()}/><Fact label="30-day check-ins" value={number(summary.check_ins).toLocaleString()}/><Fact label="30-day reviews" value={number(summary.reviews).toLocaleString()}/><Link href="/intelligence" asChild><Action label="Open Advanced Intelligence"/></Link></View>
  </Section>

  <Section title="QR & engagement" subtitle="Run location-specific trust/check-in QR assets and Growth engagement against the same location IDs.">
   <View style={card}><Text style={heading}>{qrRows.length} QR asset{qrRows.length===1?'':'s'} · {activeQr} active</Text><Text style={muted}>QR lifecycle, attribution and engagement are tied to canonical locations rather than a separate campaign-only store.</Text><View style={actions}><Link href="/qr-studio" asChild><Action label="Open QR Studio"/></Link><Link href="/engagement" asChild><Action label="Campaign engagement" secondary/></Link></View></View>
  </Section>

  <Section title="Trust & operations" subtitle="Move from location signal to corrective action, proof, reverification and prevention.">
   <View style={card}><Text style={heading}>Location operations</Text><Text style={muted}>Use trust operations and preventive work to resolve problems at individual locations, then measure whether the fix holds.</Text><View style={actions}><Link href="/trust-operations" asChild><Action label="Trust operations"/></Link><Link href="/prevention" asChild><Action label="Preventive operations" secondary/></Link><Link href="/notifications" asChild><Action label="Notify customers/team" secondary/></Link></View></View>
  </Section>

  {caps.enterpriseNetworks?<View style={enterpriseCard}><Text style={{color:'#c8ead7',fontWeight:'900'}}>FULL ENTERPRISE NETWORK AUTHORITY</Text><Text style={{color:'white',fontSize:20,fontWeight:'900'}}>This workspace also has cross-business Enterprise portfolio controls.</Text><Link href="/enterprise" asChild><Pressable style={lightAction}><Text style={{fontWeight:'900',color:'#173f2d'}}>Open Enterprise portfolio</Text></Pressable></Link></View>:<View style={card}><Text style={heading}>Growth boundary</Text><Text style={muted}>Enterprise Location is active for this Growth workspace. Cross-business partner networks, portfolio Fleet control and Enterprise Economy remain separately Enterprise-gated.</Text></View>}
 </ScrollView>;
}
function Section({title,subtitle,children}:{title:string;subtitle:string;children:React.ReactNode}){return <View style={{gap:9}}><Text style={{fontSize:22,fontWeight:'900',color:'#173024'}}>{title}</Text><Text style={muted}>{subtitle}</Text>{children}</View>}
function Metric({label,value}:{label:string;value:string|number}){return <View style={{backgroundColor:'white',borderRadius:16,padding:14,minWidth:135,flexBasis:'47%',flexGrow:1,gap:3}}><Text style={muted}>{label}</Text><Text style={{fontSize:26,fontWeight:'900',color:'#173024'}}>{value}</Text></View>}
function Fact({label,value}:{label:string;value:string}){return <View style={{flexDirection:'row',justifyContent:'space-between',gap:12,paddingVertical:3}}><Text style={muted}>{label}</Text><Text style={{fontWeight:'900',color:'#263a30',textAlign:'right'}}>{value}</Text></View>}
function Badge({text}:{text:string}){return <View style={{backgroundColor:'#e5f0e9',borderRadius:999,paddingHorizontal:10,paddingVertical:6,alignSelf:'flex-start'}}><Text style={{fontWeight:'900',color:'#28533c'}}>{text}</Text></View>}
function Action({label,secondary=false}:{label:string;secondary?:boolean}){return <Pressable style={{backgroundColor:secondary?'#edf3ef':'#173f2d',borderRadius:999,paddingHorizontal:13,paddingVertical:10}}><Text style={{fontWeight:'900',color:secondary?'#244d39':'white'}}>{label}</Text></Pressable>}
const hero={backgroundColor:'#173f2d' as const,borderRadius:22,padding:18,gap:7},card={backgroundColor:'white' as const,borderRadius:18,padding:16,gap:10},enterpriseCard={backgroundColor:'#173f2d' as const,borderRadius:18,padding:16,gap:9},heading={fontSize:19,fontWeight:'900' as const,color:'#173024' as const},muted={color:'#66766e' as const,lineHeight:20},warning={backgroundColor:'#fff7e8' as const,borderRadius:16,padding:14,gap:4},metrics={flexDirection:'row' as const,flexWrap:'wrap' as const,gap:10},spread={flexDirection:'row' as const,justifyContent:'space-between' as const,gap:10},facts={backgroundColor:'#f5f8f6' as const,borderRadius:14,padding:11,gap:2},actions={flexDirection:'row' as const,flexWrap:'wrap' as const,gap:8},lightAction={alignSelf:'flex-start' as const,backgroundColor:'#f1f7f3' as const,paddingHorizontal:14,paddingVertical:10,borderRadius:999};
