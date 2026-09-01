import { useCallback,useEffect,useState } from 'react';
import { ActivityIndicator,Pressable,RefreshControl,ScrollView,Text,View } from 'react-native';
import { useBusinessWorkspace } from '@/state/businessWorkspace';
import { getEnterpriseControlPlaneSnapshot,listOwnedEnterpriseNetworks,listEnterprisePartnerBusinesses } from '@/services/enterprise';

export default function EnterpriseWorkspace(){
 const {workspace,access}=useBusinessWorkspace();
 const [snapshot,setSnapshot]=useState<Record<string,unknown>|null>(null);const [networks,setNetworks]=useState<Array<Record<string,unknown>>>([]);const [partners,setPartners]=useState<Array<Record<string,unknown>>>([]);const [loading,setLoading]=useState(true);const [refreshing,setRefreshing]=useState(false);const [error,setError]=useState<string|null>(null);
 const load=useCallback(async()=>{if(!workspace)throw new Error('No Business workspace resolved.');if(!access?.enterprise_enabled)throw new Error('Enterprise entitlement is required for this workspace.');const [nextSnapshot,nextNetworks,nextPartners]=await Promise.all([getEnterpriseControlPlaneSnapshot(workspace.business_id,30),listOwnedEnterpriseNetworks(workspace.business_id),listEnterprisePartnerBusinesses(workspace.business_id)]);setSnapshot(nextSnapshot);setNetworks(nextNetworks);setPartners(nextPartners);},[workspace,access?.enterprise_enabled]);
 useEffect(()=>{load().catch(c=>setError(c instanceof Error?c.message:String(c))).finally(()=>setLoading(false));},[load]);
 async function refresh(){setRefreshing(true);setError(null);try{await load();}catch(c){setError(c instanceof Error?c.message:String(c));}finally{setRefreshing(false);}}
 if(loading)return <View style={{flex:1,justifyContent:'center'}}><ActivityIndicator size="large"/></View>;
 if(error)return <View style={{flex:1,padding:24,justifyContent:'center',gap:12}}><Text style={{fontSize:24,fontWeight:'800'}}>Enterprise access boundary</Text><Text style={{color:'#607168',lineHeight:21}}>{error}</Text></View>;
 return <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh}/>} contentContainerStyle={{padding:16,gap:14,paddingBottom:48}}>
  <View style={{backgroundColor:'#132b21',borderRadius:20,padding:18,gap:6}}><Text style={{color:'#bde4cf',fontWeight:'800',fontSize:12}}>ENTERPRISE CAPABILITY LAYER</Text><Text style={{color:'white',fontSize:24,fontWeight:'800'}}>Cross-business control plane</Text><Text style={{color:'#dce8e1',lineHeight:20}}>Enterprise expands Business and Fleet capabilities; it is not a separate Kleenest application.</Text></View>
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}><Metric label="Owned networks" value={networks.length}/><Metric label="Partner candidates" value={partners.length}/><Metric label="Window" value={30}/></View>
  <Section title="Enterprise snapshot" value={snapshot}/>
  <Section title="Owned partner networks" value={networks}/>
  <Section title="Partner businesses" value={partners}/>
  <Pressable onPress={refresh} style={{alignSelf:'flex-start',backgroundColor:'#173f2d',borderRadius:999,paddingHorizontal:15,paddingVertical:10}}><Text style={{color:'white',fontWeight:'800'}}>Refresh Enterprise state</Text></Pressable>
 </ScrollView>;
}
function Metric({label,value}:{label:string;value:number}){return <View style={{backgroundColor:'white',borderRadius:16,padding:14,minWidth:125,flexGrow:1}}><Text style={{fontSize:12,color:'#68776f',fontWeight:'700'}}>{label}</Text><Text style={{fontSize:25,fontWeight:'800'}}>{value}</Text></View>}
function Section({title,value}:{title:string;value:unknown}){return <View style={{backgroundColor:'white',borderRadius:16,padding:14,gap:6}}><Text style={{fontSize:17,fontWeight:'800'}}>{title}</Text><Text selectable style={{color:'#607168',lineHeight:19}}>{JSON.stringify(value??{},null,2)}</Text></View>}
