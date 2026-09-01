import * as ImagePicker from 'expo-image-picker';
import { getSupabaseClient } from '@/lib/supabase';

const BUCKET='location-photos';
const client=()=>getSupabaseClient();

function extension(mime:string|undefined,name:string|undefined){
  const fromName=name?.split('.').pop()?.toLowerCase();
  if(fromName&&['jpg','jpeg','png','webp'].includes(fromName))return fromName==='jpeg'?'jpg':fromName;
  if(mime==='image/png')return 'png';
  if(mime==='image/webp')return 'webp';
  return 'jpg';
}

export async function pickAndUploadBusinessLocationPhoto(businessId:string,locationId:string,caption?:string){
  const permission=await ImagePicker.requestMediaLibraryPermissionsAsync();
  if(!permission.granted)throw new Error('Photo library permission is required to upload location media.');
  const picked=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],quality:0.9,allowsMultipleSelection:false});
  if(picked.canceled||!picked.assets[0])return null;
  const asset=picked.assets[0];
  const {data:{user},error:userError}=await client().auth.getUser();
  if(userError)throw userError;if(!user)throw new Error('Authentication required.');
  const mime=asset.mimeType??'image/jpeg';
  const ext=extension(mime,asset.fileName??undefined);
  const path=`${user.id}/${locationId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const response=await fetch(asset.uri);const body=await response.blob();
  const upload=await client().storage.from(BUCKET).upload(path,body,{contentType:mime,upsert:false});
  if(upload.error)throw upload.error;
  const {data:mediaId,error:recordError}=await client().rpc('business_create_media',{p_business_id:businessId,p_location_id:locationId,p_storage_path:path,p_caption:caption??asset.fileName??null,p_media_type:'photo',p_mime_type:mime,p_size_bytes:asset.fileSize??body.size??null,p_width:asset.width??null,p_height:asset.height??null,p_sort_order:null});
  if(recordError){await client().storage.from(BUCKET).remove([path]);throw recordError;}
  return {id:String(mediaId),storagePath:path,publicUrl:client().storage.from(BUCKET).getPublicUrl(path).data.publicUrl};
}

export async function setFeaturedBusinessLocationPhoto(locationId:string,photoId:string){
  const {data,error}=await client().rpc('set_featured_location_photo',{p_location_id:locationId,p_photo_id:photoId});
  if(error)throw error;return data;
}

export function getBusinessLocationPhotoUrl(storagePath:string){return client().storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;}

export async function deleteBusinessLocationPhoto(businessId:string,mediaId:string,storagePath:string){
  const {data,error}=await client().rpc('business_delete_media',{p_business_id:businessId,p_media_id:mediaId});
  if(error)throw error;
  const removed=await client().storage.from(BUCKET).remove([storagePath]);
  if(removed.error)throw removed.error;
  return Boolean(data);
}
