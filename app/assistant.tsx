import { useMemo,useState } from 'react';
import { Pressable,ScrollView,Text,TextInput,View } from 'react-native';
import { getBusinessTierCapabilities,tierLabel } from '@/domain/businessTiers';
import { runBusinessAi,type BusinessAiTask } from '@/services/ai';
import { useBusinessWorkspace } from '@/state/businessWorkspace';

const suggestions=[
  {label:'What should I do next?',task:'business_growth' as const,instruction:'Identify the three highest-value actions I should review next from the current Business signals.'},
  {label:'Draft a customer update',task:'notification_copy' as const,instruction:'Draft a concise customer update using only the supplied Business context. Do not invent an offer.'},
  {label:'Explain my performance',task:'business_growth' as const,instruction:'Explain the strongest and weakest current Business signals and what I should inspect next.'},
];

export default function BusinessAssistant(){
  const{workspace,access,entitlement,dashboard}=useBusinessWorkspace();
  const caps=getBusinessTierCapabilities(access,entitlement);
  const[task,setTask]=useState<BusinessAiTask>(caps.intelligence?'business_growth':'notification_copy');
  const[instruction,setInstruction]=useState('');
  const[answer,setAnswer]=useState('');
  const[meta,setMeta]=useState('');
  const[busy,setBusy]=useState(false);
  const[error,setError]=useState<string|null>(null);
  const context=useMemo(()=>({business:{id:workspace?.business_id,name:workspace?.business_name??workspace?.name,tier:tierLabel(access,entitlement)},product_access:access??{},service_entitlement:entitlement??{},dashboard:dashboard??{}}),[workspace,access,entitlement,dashboard]);
  async function ask(nextTask=task,nextInstruction=instruction){if(!workspace||!nextInstruction.trim())return;setBusy(true);setError(null);setAnswer('');try{const result=await runBusinessAi(nextTask,context,nextInstruction.trim());setAnswer(result.answer);setMeta(`${result.provider}${result.model?` · ${result.model}`:''} · human review required`);setTask(nextTask);setInstruction(nextInstruction);}catch(e){setError(e instanceof Error?e.message:String(e));}finally{setBusy(false)}}
  return <ScrollView contentContainerStyle={{padding:16,paddingBottom:56,gap:16}}>
    <View style={{backgroundColor:'#173f2d',borderRadius:22,padding:18,gap:7}}><Text style={{color:'#c8ead7',fontWeight:'900'}}>KLEENEST AI · {tierLabel(access,entitlement).toUpperCase()}</Text><Text style={{color:'white',fontSize:24,fontWeight:'900'}}>Grounded Business copilot</Text><Text style={{color:'#dce9e2',lineHeight:21}}>AI reads the Business context already authorized for this app. It can explain, prioritize and draft; it does not bypass canonical RPCs or execute mutations.</Text></View>
    <View style={{gap:8}}><Text style={{fontSize:19,fontWeight:'900'}}>Quick actions</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{suggestions.filter(s=>s.task!=='business_growth'||caps.intelligence).map(s=><Pressable key={s.label} disabled={busy} onPress={()=>ask(s.task,s.instruction)} style={chip}><Text style={chipText}>{s.label}</Text></Pressable>)}</View></View>
    <View style={card}><Text style={{fontSize:19,fontWeight:'900'}}>Ask Kleenest AI</Text><View style={{flexDirection:'row',gap:8,flexWrap:'wrap'}}>{caps.intelligence?<Mode label="Growth analysis" active={task==='business_growth'} onPress={()=>setTask('business_growth')}/>:null}<Mode label="Notification draft" active={task==='notification_copy'} onPress={()=>setTask('notification_copy')}/></View><TextInput value={instruction} onChangeText={setInstruction} multiline placeholder={task==='business_growth'?'Ask about growth, performance, priorities or signals…':'Describe the audience and facts you want the notification to communicate…'} style={{borderWidth:1,borderColor:'#dce4df',borderRadius:14,padding:12,minHeight:120,textAlignVertical:'top'}}/><Pressable disabled={busy||!instruction.trim()} onPress={()=>ask()} style={[chip,{opacity:busy||!instruction.trim()?0.45:1}]}><Text style={chipText}>{busy?'Thinking…':'Ask AI'}</Text></Pressable></View>
    {error?<View style={{backgroundColor:'#fff0f0',borderRadius:14,padding:12}}><Text selectable style={{color:'#922'}}>{error}</Text></View>:null}
    {answer?<View style={card}><Text style={{fontSize:19,fontWeight:'900'}}>Recommendation</Text><Text selectable style={{fontSize:15,lineHeight:23,color:'#24382e'}}>{answer}</Text><Text style={{fontSize:12,color:'#6b7b72'}}>{meta}</Text></View>:null}
    <View style={{backgroundColor:'#edf4ef',borderRadius:16,padding:14,gap:4}}><Text style={{fontWeight:'900',color:'#173f2d'}}>Authority boundary</Text><Text style={{color:'#5d6e65',lineHeight:20}}>Kleenest AI is advisory. Business changes still flow through the existing authorized Business services, RPCs, RLS policies, analytics and event pipelines.</Text></View>
  </ScrollView>;
}
function Mode({label,active,onPress}:{label:string;active:boolean;onPress:()=>void}){return <Pressable onPress={onPress} style={{paddingHorizontal:11,paddingVertical:8,borderRadius:999,backgroundColor:active?'#173f2d':'#edf3ef'}}><Text style={{fontWeight:'800',color:active?'white':'#244d39'}}>{label}</Text></Pressable>}
const card={backgroundColor:'white' as const,borderRadius:18,padding:16,gap:10};const chip={alignSelf:'flex-start' as const,backgroundColor:'#173f2d' as const,paddingHorizontal:13,paddingVertical:10,borderRadius:999};const chipText={color:'white' as const,fontWeight:'900' as const};
