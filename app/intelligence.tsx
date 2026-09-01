import { useCallback,useEffect,useState } from 'react';
import { ActivityIndicator,Pressable,RefreshControl,ScrollView,Text,View } from 'react-native';
import { buildBusinessReportPayload,getGrowthIntelligenceBundle } from '@/services/intelligence';
import { useBusinessWorkspace } from '@/state/businessWorkspace';

function count(value:unknown){if(Array.isArray(value))return value.length;if(value&&typeof value==='object')return Object.keys(value as Record<string,unknown>).length;return 0;}

export default function IntelligenceScreen(){
 const {workspace,access}=useBusinessWorkspace();
 const [bundle,setBundle]=useState<Awaited<ReturnType<typeof getGrowthIntelligenceBundle>>|null>(null);
 const [report,setReport]=useState<Record<string,unknown>|null>(null);
 const [loading,setLoading]=useState(true);const [refreshing,setRefreshing]=useState(false);const [error,setError]=useState<string|null>(null);
 const allowed=Boolean(access&&(access.plan==='growth'||access.enterprise_enabled));
 const load=useCallback(async()=>{if(!workspace||!allowed)return;setBundle(await getGrowthIntelligenceBundle(workspace.business_id));},[workspace,allowed]);
 useEffect(()=>{setLoading(true);load().catch(c=>setError(c instanceof Error?c.message:String(c))).finally(()=>setLoading(false));},[load]);
 async function refresh(){setRefreshing(true);setError(null);try{await load();}catch(c){setError(c instanceof Error?c.message:String(c));}finally{setRefreshing(false);}}
 async function buildReport(){if(!workspace)return;setError(null);try{setReport(await buildBusinessReportPayload(workspace.business_id));}catch(c){setError(c instanceof Error?c.message:String(c));}}
 if(!allowed)return <View style={{flex:1,padding:24,justifyContent:'center',gap:10}}><Text style={{fontSize:24,fontWeight:'800'}}>Growth Intelligence</Text><Text style={{color:'#607067',lineHeight:21}}>This workspace requires Business Growth or Enterprise.</Text></View>;
 if(loading)return <View style={{flex:1,justifyContent:'center'}}><ActivityIndicator/></View>;
 return <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh}/>} contentContainerStyle={{padding:16,gap:16,paddingBottom:56}}>
  {error?<Text style={{color:'#9b2c2c'}}>{error}</Text>:null}
  <View style={{backgroundColor:'#173f2d',borderRadius:20,padding:18,gap:7}}><Text style={{color:'#c8ead7',fontWeight:'800',fontSize:12}}>GROWTH + ENTERPRISE INTELLIGENCE</Text><Text style={{color:'white',fontSize:22,fontWeight:'800'}}>Canonical analytics, operations and recommendations</Text><Text style={{color:'#dce9e2'}}>No parallel metrics engine. This screen composes the existing Architecture/Supabase intelligence authority.</Text></View>
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}><Metric label="Authority" value={count(bundle?.authority)}/><Metric label="Growth" value={count(bundle?.growth)}/><Metric label="Assets" value={count(bundle?.assets)}/><Metric label="Benchmarks" value={count(bundle?.benchmarks)}/><Metric label="Operations" value={count(bundle?.operations)}/><Metric label="Recommendations" value={count(bundle?.recommendations)}/></View>
  <Section title="Growth cockpit" value={bundle?.cockpit}/><Section title="ROI" value={bundle?.roi}/><Section title="Location intelligence" value={bundle?.locations}/><Section title="Preventive recommendations" value={bundle?.recommendations}/><Section title="Reverification queue" value={bundle?.reverification}/><Section title="Optimization history" value={bundle?.history}/>
  <Pressable onPress={buildReport} style={{alignSelf:'flex-start',backgroundColor:'#173f2d',paddingHorizontal:14,paddingVertical:10,borderRadius:999}}><Text style={{color:'white',fontWeight:'800'}}>Build 30-day report payload</Text></Pressable>
  {report?<Section title="Reporting payload" value={report}/>:null}
 </ScrollView>;
}
function Metric({label,value}:{label:string;value:number}){return <View style={{backgroundColor:'white',borderRadius:16,padding:14,minWidth:110,flexGrow:1}}><Text style={{color:'#66766e',fontSize:12,fontWeight:'700'}}>{label}</Text><Text style={{fontSize:24,fontWeight:'800'}}>{value}</Text></View>}
function Section({title,value}:{title:string;value:unknown}){return <View style={{backgroundColor:'white',borderRadius:16,padding:14,gap:5}}><Text style={{fontSize:17,fontWeight:'800'}}>{title}</Text><Text selectable style={{color:'#5f6f66',lineHeight:19}}>{JSON.stringify(value??{},null,2)}</Text></View>}
