import { useEffect,useState } from 'react';
import { ActivityIndicator,RefreshControl,ScrollView,Text,View } from 'react-native';
import { useBusinessWorkspace } from '@/state/businessWorkspace';
import { getBusinessProgressionEngagementSnapshot,type BusinessProgressionEngagementSnapshot } from '@/services/progressionEngagement';

export default function BusinessProgressionPage(){
  const{workspace}=useBusinessWorkspace();
  const[data,setData]=useState<BusinessProgressionEngagementSnapshot|null>(null),[loading,setLoading]=useState(true),[refreshing,setRefreshing]=useState(false),[error,setError]=useState<string|null>(null);
  async function load(refresh=false){if(!workspace?.business_id){setError('No Business workspace is selected.');setLoading(false);return}refresh?setRefreshing(true):setLoading(true);setError(null);try{setData(await getBusinessProgressionEngagementSnapshot(workspace.business_id))}catch(cause){setError(cause instanceof Error?cause.message:String(cause))}finally{setLoading(false);setRefreshing(false)}}
  useEffect(()=>{void load()},[workspace?.business_id]);
  if(loading)return <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator size="large"/></View>;
  return <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>load(true)}/>} contentContainerStyle={{padding:16,paddingBottom:48,gap:16}}>
    <View style={{gap:5}}><Text style={{fontSize:12,fontWeight:'900',letterSpacing:1.1,color:'#51705e'}}>COMMUNITY PROGRESSION</Text><Text style={{fontSize:29,fontWeight:'900',color:'#13271d'}}>How contributors strengthen your locations</Text><Text style={{fontSize:14,lineHeight:21,color:'#617168'}}>Discovery, verification and evidence XP are read from the same canonical progression stream consumers use. Campaign rewards never change verification authority.</Text></View>
    {error?<View style={{padding:14,borderRadius:16,backgroundColor:'#fff0ec'}}><Text style={{fontWeight:'900',color:'#8c3420'}}>{error}</Text></View>:null}
    <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>
      <Metric label="Discoveries" value={data?.discoveries??0} detail="Community discovery contributions tied to your canonical locations."/>
      <Metric label="Locations discovered" value={data?.discovered_locations??0} detail="Distinct canonical locations receiving discovery activity."/>
      <Metric label="Contributor XP" value={data?.xp_at_locations??0} detail="Trusted XP awarded for useful actions at your locations."/>
      <Metric label="Contributors" value={data?.contributors??0} detail="Distinct people strengthening your location data."/>
      <Metric label="Active campaigns" value={data?.active_campaigns??0} detail="Business campaigns currently eligible for consumer exposure."/>
    </View>
    <View style={{backgroundColor:'#173f2d',borderRadius:20,padding:17,gap:6}}><Text style={{color:'#c5e4d2',fontSize:11,fontWeight:'900',letterSpacing:1}}>TRUST + ENGAGEMENT</Text><Text style={{color:'white',fontSize:20,fontWeight:'900'}}>On-site evidence is intentionally worth more than remote discovery.</Text><Text style={{color:'#d9e8df',lineHeight:20}}>Kleenest can reward contributors for helping your locations while preserving source, evidence strength, freshness and independent verification as separate trust signals.</Text></View>
    <View style={{gap:9}}><Text style={{fontSize:22,fontWeight:'900',color:'#13271d'}}>Recent progression activity</Text>{data?.recent_actions?.length?data.recent_actions.map((item,index)=><View key={`${item.created_at}-${index}`} style={{backgroundColor:'white',borderRadius:16,padding:14,gap:4}}><View style={{flexDirection:'row',justifyContent:'space-between',gap:10}}><Text style={{fontSize:15,fontWeight:'900',color:'#173024',flex:1}}>{String(item.action||'progression').replaceAll('_',' ')}</Text><Text style={{fontSize:14,fontWeight:'900',color:'#19603d'}}>+{Number(item.xp||0)} XP</Text></View><Text style={{fontSize:12,color:'#6b7a72'}}>{item.created_at?new Date(item.created_at).toLocaleString():''}{item.location_id?` · location ${item.location_id.slice(0,8)}…`:''}</Text></View>):<View style={{backgroundColor:'white',borderRadius:16,padding:14}}><Text style={{color:'#66766e'}}>No canonical progression events have posted at this business yet.</Text></View>}</View>
  </ScrollView>
}
function Metric({label,value,detail}:{label:string;value:number;detail:string}){return <View style={{backgroundColor:'white',borderRadius:18,padding:15,minWidth:150,flexBasis:'47%',flexGrow:1,gap:4}}><Text style={{fontSize:12,fontWeight:'800',color:'#697a70'}}>{label}</Text><Text style={{fontSize:27,fontWeight:'900',color:'#14271d'}}>{Number(value||0).toLocaleString()}</Text><Text style={{fontSize:11,lineHeight:16,color:'#728077'}}>{detail}</Text></View>}
