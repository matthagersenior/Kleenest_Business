import { Link } from 'expo-router';
import { useCallback,useEffect,useMemo,useState } from 'react';
import { ActivityIndicator,Pressable,RefreshControl,ScrollView,Text,View } from 'react-native';
import { getCoreEngagementBundle,listQrEngagementPrograms,createQrEngagementProgram,manageQr,setQrActive,setQrCustomization,type EngagementRecord } from '@/services/engagement';
import { listBusinessLocations,type BusinessLocation } from '@/services/business';
import { useBusinessWorkspace } from '@/state/businessWorkspace';

function arrayFrom(value:unknown):EngagementRecord[]{if(Array.isArray(value))return value as EngagementRecord[];if(value&&typeof value==='object')for(const key of['items','rows','qr_codes','qrs','detail']){const nested=(value as Record<string,unknown>)[key];if(Array.isArray(nested))return nested as EngagementRecord[];}return[];}
function idOf(x:EngagementRecord){return String(x.id??'');}
function titleOf(x:EngagementRecord){return String(x.title??x.name??x.label??'Kleenest QR');}
function locationIsActive(location:BusinessLocation){return Boolean(location.is_active??location.active??true);}

export default function QrStudio(){
 const{workspace,refresh:refreshWorkspace}=useBusinessWorkspace();
 const[locations,setLocations]=useState<BusinessLocation[]>([]),[locationId,setLocationId]=useState<string|null>(null),[bundle,setBundle]=useState<Awaited<ReturnType<typeof getCoreEngagementBundle>>|null>(null),[programs,setPrograms]=useState<Record<string,EngagementRecord[]>>({}),[loading,setLoading]=useState(true),[refreshing,setRefreshing]=useState(false),[busy,setBusy]=useState<string|null>(null),[error,setError]=useState<string|null>(null);
 const load=useCallback(async()=>{if(!workspace)return;const[nextLocations,nextBundle]=await Promise.all([listBusinessLocations(workspace.business_id),getCoreEngagementBundle(workspace.business_id)]);const activeLocations=nextLocations.filter(locationIsActive);setLocations(activeLocations);setLocationId(current=>activeLocations.some(location=>location.id===current)?current:activeLocations[0]?.id??null);setBundle(nextBundle);const qrs=arrayFrom(nextBundle.qr);const pairs=await Promise.all(qrs.filter(q=>q.id).map(async q=>{try{return[idOf(q),await listQrEngagementPrograms(idOf(q))] as const}catch{return[idOf(q),[]] as const}}));setPrograms(Object.fromEntries(pairs));},[workspace]);
 useEffect(()=>{setLoading(true);load().catch(e=>setError(e instanceof Error?e.message:String(e))).finally(()=>setLoading(false));},[load]);
 async function reload(){setRefreshing(true);setError(null);try{await Promise.all([load(),refreshWorkspace()]);}catch(e){setError(e instanceof Error?e.message:String(e));}finally{setRefreshing(false)}}
 async function run(key:string,action:()=>Promise<unknown>){setBusy(key);setError(null);try{await action();await reload();}catch(e){setError(e instanceof Error?e.message:String(e));}finally{setBusy(null)}}
 const qrs=useMemo(()=>arrayFrom(bundle?.qr),[bundle]);
 if(loading)return <View style={{flex:1,justifyContent:'center'}}><ActivityIndicator/></View>;
 if(!workspace)return <View style={{padding:20}}><Text>Business workspace required.</Text></View>;
 const businessId=workspace.business_id;
 const selectedLocation=locations.find(location=>location.id===locationId)??null;
 return <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload}/>} contentContainerStyle={{padding:16,paddingBottom:56,gap:16}}>
  {error?<View style={{backgroundColor:'#fff0f0',borderRadius:14,padding:12}}><Text selectable style={{color:'#922'}}>{error}</Text></View>:null}
  <View style={hero}><Text style={{color:'#c8ead7',fontWeight:'900'}}>QR STUDIO · STANDARD+</Text><Text style={{color:'white',fontSize:24,fontWeight:'900'}}>Create, activate and measure your Kleenest QR network</Text><Text style={{color:'#dce9e2',lineHeight:20}}>QR lifecycle, check-ins, attribution and engagement programs use the shared Kleenest backend. Growth and Enterprise can combine these QR assets with advanced campaigns in Engagement.</Text></View>
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}><Metric label="QR assets" value={qrs.length}/><Metric label="Active" value={qrs.filter(q=>q.active!==false).length}/><Metric label="Programs" value={Object.values(programs).reduce((n,x)=>n+x.length,0)}/></View>
  <View style={card}>
   <Text style={heading}>New QR</Text>
   {locations.length?<>
    <Text style={muted}>Choose the active canonical location this QR belongs to.</Text>
    <View style={row}>{locations.map(location=>{const active=location.id===locationId;return <Pressable key={location.id} onPress={()=>setLocationId(location.id)} style={{borderRadius:999,paddingHorizontal:11,paddingVertical:8,backgroundColor:active?'#173f2d':'#edf3ef'}}><Text style={{fontWeight:'900',color:active?'white':'#244d39'}}>{location.name}</Text></Pressable>})}</View>
    <Text style={muted}>{selectedLocation?`New QR will attach to ${selectedLocation.name}.`:'Select a location.'}</Text>
    <Action disabled={!locationId||Boolean(busy)} label={busy==='create'?'Creating…':'Create location QR'} onPress={()=>locationId?run('create',()=>manageQr(businessId,locationId,null,'create',{label:'Kleenest location QR',customization:{brand:'kleenest'}})):undefined}/>
   </>:<>
    <Text style={muted}>This workspace has no active canonical location yet. Find an existing Kleenest place and claim it, or create a genuinely new location.</Text>
    <Link href="/locations" asChild><Pressable style={{alignSelf:'flex-start',backgroundColor:'#173f2d',paddingHorizontal:12,paddingVertical:9,borderRadius:999}}><Text style={{color:'white',fontWeight:'900'}}>Find or add a location</Text></Pressable></Link>
   </>}
  </View>
  <View style={{gap:10}}><Text style={heading}>QR assets</Text>{qrs.length?qrs.map((qr,i)=>{const id=idOf(qr),active=qr.active!==false,p=programs[id]??[];return <View key={id||i} style={card}><View style={{flexDirection:'row',justifyContent:'space-between',gap:10}}><View style={{flex:1}}><Text style={{fontSize:17,fontWeight:'900'}}>{titleOf(qr)}</Text><Text style={muted}>{active?'Active':'Inactive'} · {p.length} engagement program{p.length===1?'':'s'}</Text></View><View style={{backgroundColor:active?'#dff2e6':'#ecefed',borderRadius:999,paddingHorizontal:10,paddingVertical:6,alignSelf:'flex-start'}}><Text style={{fontWeight:'900',color:'#244d39'}}>{active?'LIVE':'OFF'}</Text></View></View><View style={row}><Action disabled={Boolean(busy)} label={active?'Deactivate':'Reactivate'} onPress={()=>run(`active:${id}`,()=>setQrActive(businessId,id,!active))}/><Action disabled={Boolean(busy)} label="Apply Kleenest trust style" onPress={()=>run(`style:${id}`,()=>setQrCustomization(businessId,id,{brand:'kleenest',theme:'trust-network',purpose:'business_location'}))}/><Action disabled={Boolean(busy)} label="Add check-in program" onPress={()=>run(`program:${id}`,()=>createQrEngagementProgram(id,{programType:'checkin',name:'Kleenest check-in',description:'Verified Business check-in engagement',triggerCount:1}))}/></View>{p.length?<View style={{gap:5}}>{p.map((program,j)=><Text key={String(program.id??j)} style={muted}>• {String(program.name??program.program_type??'QR engagement program')}</Text>)}</View>:null}</View>}):<View style={card}><Text style={muted}>No QR assets yet.</Text></View>}</View>
  <View style={card}><Text style={heading}>Attribution</Text><Text style={muted}>QR analytics and attribution are read from the canonical Business QR detail and attribution funnel. No parallel tracking layer is created in this app.</Text></View>
 </ScrollView>;
}
function Metric({label,value}:{label:string;value:number}){return <View style={{backgroundColor:'white',borderRadius:16,padding:14,minWidth:105,flexGrow:1}}><Text style={muted}>{label}</Text><Text style={{fontSize:25,fontWeight:'900'}}>{value}</Text></View>}
function Action({label,onPress,disabled}:{label:string;onPress:()=>void|Promise<void>|undefined;disabled?:boolean}){return <Pressable disabled={disabled} onPress={onPress} style={{alignSelf:'flex-start',backgroundColor:'#173f2d',paddingHorizontal:12,paddingVertical:9,borderRadius:999,opacity:disabled?0.45:1}}><Text style={{color:'white',fontWeight:'900'}}>{label}</Text></Pressable>}
const hero={backgroundColor:'#173f2d' as const,borderRadius:22,padding:18,gap:7},card={backgroundColor:'white' as const,borderRadius:18,padding:16,gap:9},heading={fontSize:20,fontWeight:'900' as const},muted={color:'#66766e' as const,lineHeight:20},row={flexDirection:'row' as const,flexWrap:'wrap' as const,gap:8};
