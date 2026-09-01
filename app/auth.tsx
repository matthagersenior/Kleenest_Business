import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable,ScrollView,Text,TextInput,View } from 'react-native';
import { signInBusiness,signOutBusiness } from '@/services/auth';
import { useBusinessWorkspace } from '@/state/businessWorkspace';

export default function BusinessAuthScreen(){
 const { refresh } = useBusinessWorkspace();
 const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState<string|null>(null);
 async function signIn(){if(!email.trim()||!password)return;setBusy(true);setError(null);try{await signInBusiness(email,password);await refresh();router.replace('/');}catch(c){setError(c instanceof Error?c.message:String(c));}finally{setBusy(false);}}
 async function signOut(){setBusy(true);try{await signOutBusiness();await refresh();router.replace('/');}catch(c){setError(c instanceof Error?c.message:String(c));}finally{setBusy(false);}}
 return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:20,gap:14,paddingBottom:48}}>
  <View style={{backgroundColor:'#173f2d',borderRadius:20,padding:18,gap:6}}><Text style={{color:'#c8ead7',fontWeight:'800'}}>BUSINESS AUTHENTICATION</Text><Text style={{color:'white',fontSize:24,fontWeight:'800'}}>Sign in to Kleenest Business</Text><Text style={{color:'#dce9e2'}}>Your Supabase session resolves the Business workspaces, roles and capabilities you are authorized to use.</Text></View>
  {error?<Text style={{color:'#9b2c2c'}}>{error}</Text>:null}
  <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email" style={input}/>
  <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" style={input}/>
  <Pressable disabled={busy||!email.trim()||!password} onPress={signIn} style={button}><Text style={buttonText}>{busy?'Working…':'Sign in'}</Text></Pressable>
  <Pressable disabled={busy} onPress={signOut} style={[button,{backgroundColor:'#edf3ef'}]}><Text style={{fontWeight:'800',color:'#244d39'}}>Sign out current session</Text></Pressable>
 </ScrollView>;
}
const input={backgroundColor:'white' as const,borderWidth:1,borderColor:'#dce4df',borderRadius:14,padding:14,fontSize:16};const button={alignSelf:'flex-start' as const,backgroundColor:'#173f2d',borderRadius:999,paddingHorizontal:16,paddingVertical:11};const buttonText={color:'white',fontWeight:'800' as const};
