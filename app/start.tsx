import { router } from 'expo-router';
import { useEffect,useState } from 'react';
import { ActivityIndicator,Pressable,ScrollView,Text,TextInput,View } from 'react-native';
import { createBusinessForCurrentUser,getCurrentSession,listBusinessWorkspaces } from '@/services/business';
import { useBusinessWorkspace } from '@/state/businessWorkspace';

export default function BusinessStartScreen(){
  const { refresh }=useBusinessWorkspace();
  const [name,setName]=useState('');
  const [checking,setChecking]=useState(true);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState<string|null>(null);

  useEffect(()=>{
    let active=true;
    (async()=>{
      const session=await getCurrentSession();
      if(!session){router.replace('/auth');return;}
      const workspaces=await listBusinessWorkspaces(true);
      if(!active)return;
      if(workspaces.length){await refresh();router.replace('/locations');return;}
      setChecking(false);
    })().catch(cause=>{if(active){setError(cause instanceof Error?cause.message:String(cause));setChecking(false);}});
    return()=>{active=false};
  },[refresh]);

  async function continueToClaim(){
    if(!name.trim()||busy)return;
    setBusy(true);setError(null);
    try{
      await createBusinessForCurrentUser(name);
      await refresh();
      router.replace('/locations');
    }catch(cause){setError(cause instanceof Error?cause.message:String(cause))}
    finally{setBusy(false)}
  }

  if(checking)return <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator size="large"/></View>;
  return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:20,paddingBottom:48,gap:14}}>
    <View style={hero}><Text style={eyebrow}>FREE LOCATION CLAIM</Text><Text style={heroTitle}>One quick step</Text><Text style={heroBody}>Tell Kleenest the business name so we can create your pending Business workspace. Then you go directly to the existing-location claim search.</Text></View>
    <View style={card}><Text style={title}>Business name</Text><Text style={muted}>Use the public-facing name customers know. No address, payment or plan selection is required here.</Text><TextInput autoFocus value={name} onChangeText={setName} onSubmitEditing={continueToClaim} returnKeyType="go" placeholder="Business name" placeholderTextColor="#7f8d85" style={input}/><Pressable disabled={busy||!name.trim()} onPress={continueToClaim} style={[button,(busy||!name.trim())&&{opacity:.5}]}><Text style={buttonText}>{busy?'Setting up…':'Continue to free claim'}</Text></Pressable></View>
    <View style={trust}><Text style={trustTitle}>Verification stays the same</Text><Text style={muted}>Free claiming only removes the price barrier. Business identity and location-authority verification are unchanged before management access is approved.</Text></View>
    {error?<Text selectable style={{color:'#9b2c2c'}}>{error}</Text>:null}
  </ScrollView>;
}
const hero={backgroundColor:'#173f2d' as const,borderRadius:22,padding:18,gap:7};
const eyebrow={fontSize:10,fontWeight:'900' as const,letterSpacing:1.2,color:'#c8ead7' as const};
const heroTitle={fontSize:27,fontWeight:'900' as const,color:'white' as const};
const heroBody={color:'#dce9e2' as const,lineHeight:20};
const card={backgroundColor:'white' as const,borderRadius:18,padding:16,gap:10};
const trust={backgroundColor:'#eaf5ee' as const,borderRadius:18,padding:15,gap:6};
const trustTitle={fontSize:16,fontWeight:'900' as const,color:'#173f2d' as const};
const title={fontSize:20,fontWeight:'900' as const,color:'#173024' as const};
const muted={color:'#66766e' as const,lineHeight:20};
const input={backgroundColor:'#f8faf9' as const,borderWidth:1,borderColor:'#d8e1dc' as const,borderRadius:14,paddingHorizontal:14,paddingVertical:13,fontSize:16,color:'#111827' as const};
const button={alignSelf:'flex-start' as const,backgroundColor:'#173f2d' as const,borderRadius:999,paddingHorizontal:16,paddingVertical:11};
const buttonText={color:'white' as const,fontWeight:'900' as const};
