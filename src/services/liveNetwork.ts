import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { getSupabaseClient } from '@/lib/supabase';

export const BUSINESS_GEOFENCE_TASK='kleenest-business-live-network-geofence';
const APP_ID='com.kleenest.business';

type ManifestRow={geofence_id:string;business_id:string;location_id:string;radius_meters:number;notification_enabled:boolean;active:boolean;location_name:string|null;latitude:number;longitude:number};

function decodeIdentifier(identifier:string){const [geofenceId,businessId,locationId]=identifier.split('|');return {geofenceId,businessId,locationId};}

if(!TaskManager.isTaskDefined(BUSINESS_GEOFENCE_TASK)){
  TaskManager.defineTask(BUSINESS_GEOFENCE_TASK,async({data,error}:any)=>{
    if(error||!data)return;
    const {eventType,region}=data;
    const ids=decodeIdentifier(String(region?.identifier??''));
    if(!ids.geofenceId||!ids.businessId||!ids.locationId)return;
    const client=getSupabaseClient();
    const {data:auth}=await client.auth.getUser();
    if(!auth.user)return;
    const type=eventType===Location.GeofencingEventType.Enter?'enter':eventType===Location.GeofencingEventType.Exit?'exit':'unknown';
    if(type==='unknown')return;
    await client.rpc('record_geofence_event',{
      p_geofence_id:ids.geofenceId,p_user_id:auth.user.id,p_location_id:ids.locationId,p_business_id:ids.businessId,p_event_type:type,p_dwell_seconds:null,
      p_metadata:{source:'business_live_network_background',platform:Platform.OS},p_notification_id:null,p_qr_code_id:null,p_check_in_id:null
    });
  });
}

export async function listLiveNetworkManifest(businessId:string):Promise<ManifestRow[]>{
  const {data,error}=await getSupabaseClient().rpc('business_live_network_manifest',{p_business_id:businessId});
  if(error)throw new Error(error.message);
  return (Array.isArray(data)?data:[]) as ManifestRow[];
}

export async function getLiveNetworkStatus(){
  const [foreground,background,services,registered]=await Promise.all([
    Location.getForegroundPermissionsAsync(),Location.getBackgroundPermissionsAsync(),Location.hasServicesEnabledAsync(),TaskManager.isTaskRegisteredAsync(BUSINESS_GEOFENCE_TASK).catch(()=>false)
  ]);
  return {foreground:foreground.status,background:background.status,services,registered};
}

export async function registerLiveNetworkPush(){
  const permission=await Notifications.requestPermissionsAsync();
  if(permission.status!=='granted')throw new Error('Notification permission is required for Live Network alerts.');
  if(Platform.OS==='android')await Notifications.setNotificationChannelAsync('live-network',{name:'Live Network',importance:Notifications.AndroidImportance.HIGH});
  const projectId=String(Constants.expoConfig?.extra?.eas?.projectId??'');
  if(!projectId)throw new Error('Expo project identity is missing for push registration.');
  const token=await Notifications.getExpoPushTokenAsync({projectId});
  const {error}=await getSupabaseClient().rpc('register_notification_native_push_token',{p_token:token.data,p_platform:Platform.OS,p_app_id:APP_ID});
  if(error)throw new Error(error.message);
  return token.data;
}

export async function enableLiveNetwork(businessId:string){
  const foreground=await Location.requestForegroundPermissionsAsync();
  if(foreground.status!=='granted')throw new Error('Precise location permission is required to enable Live Network geofences.');
  const background=await Location.requestBackgroundPermissionsAsync();
  if(background.status!=='granted')throw new Error('Background location permission is required for Live Network alerts when Business is not open.');
  const manifest=await listLiveNetworkManifest(businessId);
  if(!manifest.length)throw new Error('No active Business geofences with coordinates are configured yet.');
  const maximum=Platform.OS==='ios'?20:100;
  const regions=manifest.slice(0,maximum).map(row=>({
    identifier:`${row.geofence_id}|${row.business_id}|${row.location_id}`,
    latitude:Number(row.latitude),longitude:Number(row.longitude),radius:Math.max(50,Math.min(Number(row.radius_meters||150),1000)),notifyOnEnter:true,notifyOnExit:true
  }));
  await Location.startGeofencingAsync(BUSINESS_GEOFENCE_TASK,regions);
  return {registered:regions.length,total:manifest.length,platformLimit:maximum};
}

export async function disableLiveNetwork(){
  const registered=await TaskManager.isTaskRegisteredAsync(BUSINESS_GEOFENCE_TASK).catch(()=>false);
  if(registered)await Location.stopGeofencingAsync(BUSINESS_GEOFENCE_TASK);
}
