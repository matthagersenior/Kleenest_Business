import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { createBusinessLocation, listBusinessLocations, listBusinessMedia, listLocationAmenities, setBusinessLocationActive, setLocationAmenity, updateBusinessLocation, type BusinessAmenity, type BusinessLocation, type BusinessMedia } from '@/services/business';
import { deleteBusinessLocationPhoto, getBusinessLocationPhotoUrl, pickAndUploadBusinessLocationPhoto, setFeaturedBusinessLocationPhoto } from '@/services/media';
import { listBusinessLocationClaims, requestLocationClaim, searchClaimableLocations, type BusinessLocationClaim, type ClaimableLocation } from '@/services/locationClaims';
import { useBusinessWorkspace } from '@/state/businessWorkspace';

const empty = { name: '', address: '', city: '', state: '', postalCode: '', latitude: '', longitude: '', phone: '', website: '' };

export default function Screen() {
  const { workspace, access, refresh: refreshWorkspace } = useBusinessWorkspace();
  const [locations, setLocations] = useState<BusinessLocation[]>([]);
  const [media, setMedia] = useState<BusinessMedia[]>([]);
  const [amenities, setAmenities] = useState<Record<string, BusinessAmenity[]>>({});
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<BusinessLocation | null>(null);
  const [amenityId, setAmenityId] = useState('');
  const [mode, setMode] = useState<'managed' | 'claim'>('managed');
  const [claimQuery, setClaimQuery] = useState('');
  const [claimResults, setClaimResults] = useState<ClaimableLocation[]>([]);
  const [claims, setClaims] = useState<BusinessLocationClaim[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!workspace) return;
    const [nextLocations, nextMedia, nextClaims] = await Promise.all([
      listBusinessLocations(workspace.business_id),
      listBusinessMedia(workspace.business_id),
      listBusinessLocationClaims(workspace.business_id),
    ]);
    const nextAmenities = await Promise.all(
      nextLocations.map(async location => [location.id, await listLocationAmenities(workspace.business_id, location.id)] as const),
    );
    setLocations(nextLocations);
    setMedia(nextMedia);
    setClaims(nextClaims);
    setAmenities(Object.fromEntries(nextAmenities));
  }, [workspace]);

  useEffect(() => {
    setLoading(true);
    load().catch(cause => setError(cause instanceof Error ? cause.message : String(cause))).finally(() => setLoading(false));
  }, [load]);

  async function reload() {
    setRefreshing(true);
    setError(null);
    try { await Promise.all([load(), refreshWorkspace()]); }
    catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
    finally { setRefreshing(false); }
  }

  async function run(key: string, fn: () => Promise<unknown>, success?: string) {
    setBusy(key); setError(null); setNotice(null);
    try { await fn(); if (success) setNotice(success); await reload(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
    finally { setBusy(null); }
  }

  async function save() {
    if (!workspace || !form.name.trim()) return;
    await run('location-save', async () => {
      if (editing) {
        await updateBusinessLocation(editing.id, {
          name: form.name.trim(),
          address: form.address || null,
          phone: form.phone || null,
          website: form.website || null,
          active: Boolean(editing.is_active ?? editing.active ?? true),
        });
      } else {
        if (access?.location_limit != null && locations.length >= access.location_limit) {
          throw new Error('Location entitlement reached. Upgrade this workspace to add another managed location.');
        }
        await createBusinessLocation(workspace.business_id, {
          name: form.name.trim(),
          address: form.address || null,
          city: form.city || null,
          state: form.state || null,
          postalCode: form.postalCode || null,
          latitude: form.latitude.trim() ? Number(form.latitude) : null,
          longitude: form.longitude.trim() ? Number(form.longitude) : null,
          phone: form.phone || null,
          website: form.website || null,
        });
      }
      setEditing(null);
      setForm(empty);
    }, editing ? 'Location updated.' : 'Canonical location created and attached to this business.');
  }

  async function searchClaims() {
    if (!workspace) return;
    setBusy('claim-search'); setError(null);
    try { setClaimResults(await searchClaimableLocations(workspace.business_id, claimQuery, 50)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
    finally { setBusy(null); }
  }

  const pendingByLocation = useMemo(() => new Map(claims.map(claim => [claim.location_id, claim.status])), [claims]);

  if (loading) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;
  if (!workspace) return <View style={{ padding: 24 }}><Text>No Business workspace is selected.</Text></View>;

  return <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} />} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 60 }}>
    <View style={hero}>
      <Text style={{ color: '#c8ead7', fontWeight: '900', letterSpacing: 1 }}>CANONICAL LOCATION NETWORK</Text>
      <Text style={{ color: 'white', fontSize: 24, fontWeight: '900' }}>{workspace.business_name ?? workspace.name ?? 'Business'} locations</Text>
      <Text style={{ color: '#dce9e2', lineHeight: 20 }}>Create a new place only when it does not already exist. Otherwise find the existing Kleenest place and claim it so reviews, trust, QR, Fleet and analytics stay attached to one location ID.</Text>
    </View>

    {error ? <View style={errorCard}><Text selectable style={{ color: '#922', fontWeight: '700' }}>{error}</Text></View> : null}
    {notice ? <View style={noticeCard}><Text style={{ color: '#22563c', fontWeight: '700' }}>{notice}</Text></View> : null}

    <View style={card}>
      <Text style={title}>{locations.length} managed location{locations.length === 1 ? '' : 's'}</Text>
      <Text>{access?.location_limit == null ? 'Unlimited location entitlement' : `${locations.length} of ${access.location_limit} location entitlement used`}</Text>
      <View style={row}>
        <Tab label="Managed locations" active={mode === 'managed'} onPress={() => setMode('managed')} />
        <Tab label="Find & claim existing" active={mode === 'claim'} onPress={() => setMode('claim')} />
      </View>
    </View>

    {mode === 'claim' ? <>
      <View style={card}>
        <Text style={title}>Find an existing Kleenest place</Text>
        <Text style={muted}>Search by business name, brand, street address, city or state. Claiming prevents duplicate locations and preserves existing trust history.</Text>
        <View style={row}>
          <TextInput value={claimQuery} onChangeText={setClaimQuery} onSubmitEditing={searchClaims} placeholder="Name, brand, address or city" style={[input, { flex: 1, minWidth: 220 }]} />
          <Button label={busy === 'claim-search' ? 'Searching…' : 'Search'} disabled={busy === 'claim-search'} onPress={searchClaims} />
        </View>
      </View>
      {claims.length ? <View style={card}>
        <Text style={title}>Your claim requests</Text>
        {claims.slice(0, 12).map(claim => <View key={claim.claim_id} style={inner}><Text style={{ fontWeight: '900' }}>{claim.location_name}</Text><Text style={muted}>{claim.status.toUpperCase()} · {new Date(claim.updated_at).toLocaleString()}</Text></View>)}
      </View> : null}
      {claimResults.map(item => {
        const status = pendingByLocation.get(item.id) ?? item.claim_status;
        const waiting = status === 'pending';
        const approved = status === 'approved';
        return <View key={item.id} style={card}>
          <Text style={title}>{item.name || 'Unnamed place'}</Text>
          <Text style={muted}>{[item.address, item.city, item.state, item.postal_code].filter(Boolean).join(', ') || 'Address unavailable'}</Text>
          <Text style={muted}>{item.place_type ? item.place_type.replaceAll('_', ' ') : 'Place'}{item.rating != null ? ` · ★ ${Number(item.rating).toFixed(1)} (${item.review_count ?? 0})` : ''}</Text>
          {item.latitude != null && item.longitude != null ? <Text style={muted}>{Number(item.latitude).toFixed(5)}, {Number(item.longitude).toFixed(5)}</Text> : null}
          <Button label={approved ? 'Already managed' : waiting ? 'Claim pending' : busy === `claim:${item.id}` ? 'Requesting…' : 'Claim this location'} disabled={approved || waiting || busy === `claim:${item.id}`} onPress={() => run(`claim:${item.id}`, () => requestLocationClaim(workspace.business_id, item.id), 'Claim submitted. It will become manageable after approval.')} />
        </View>;
      })}
      {claimResults.length === 0 && claimQuery.trim() ? <View style={card}><Text style={muted}>No matching unclaimed canonical locations were found. If this is a genuinely new place, use Managed locations → Add new location.</Text></View> : null}
    </> : <>
      <View style={card}>
        <Text style={title}>{editing ? 'Edit location' : 'Add a genuinely new location'}</Text>
        {!editing ? <Text style={muted}>Use this only when the physical place does not already exist in Kleenest. Search the claim network first when possible.</Text> : null}
        {(['name', 'address', 'city', 'state', 'postalCode', 'latitude', 'longitude', 'phone', 'website'] as const).map(key => <TextInput key={key} value={form[key]} onChangeText={value => setForm(current => ({ ...current, [key]: value }))} placeholder={key} keyboardType={key === 'latitude' || key === 'longitude' ? 'decimal-pad' : 'default'} style={input} />)}
        <View style={row}>
          <Button label={busy === 'location-save' ? 'Saving…' : editing ? 'Save location' : 'Create location'} disabled={busy === 'location-save'} onPress={save} />
          {editing ? <Button label="Cancel edit" secondary onPress={() => { setEditing(null); setForm(empty); }} /> : null}
        </View>
      </View>

      {locations.map(location => {
        const active = Boolean(location.is_active ?? location.active ?? true);
        const locationAmenities = amenities[location.id] ?? [];
        const locationMedia = media.filter(item => item.location_id === location.id);
        return <View key={location.id} style={card}>
          <Text style={title}>{location.name}</Text>
          <Text>{[location.address, location.city, location.state].filter(Boolean).join(', ') || 'Address incomplete'} · {active ? 'ACTIVE' : 'INACTIVE'}</Text>
          {location.latitude != null && location.longitude != null ? <Text style={muted}>{Number(location.latitude).toFixed(5)}, {Number(location.longitude).toFixed(5)} · ready for map/Fleet routing</Text> : <Text style={{ color: '#9a651d' }}>Add coordinates to make this location routable and geofence-ready.</Text>}
          <Text style={muted}>{locationAmenities.length} amenities · {locationMedia.length} media</Text>
          <View style={row}>
            <Button label="Edit" onPress={() => { setEditing(location); setForm({ name: location.name, address: String(location.address ?? ''), city: String(location.city ?? ''), state: String(location.state ?? ''), postalCode: String(location.postal_code ?? ''), latitude: location.latitude == null ? '' : String(location.latitude), longitude: location.longitude == null ? '' : String(location.longitude), phone: String(location.phone ?? ''), website: String(location.website ?? '') }); }} />
            <Button label={active ? 'Deactivate' : 'Activate'} secondary onPress={() => run(`active:${location.id}`, () => setBusinessLocationActive(location.id, !active))} />
          </View>
          <Text style={section}>Amenities</Text>
          {locationAmenities.map(item => <View key={item.amenity_id} style={row}><Text style={{ flex: 1 }}>{item.name}</Text><Button label="Remove" secondary onPress={() => run(`amenity:${item.amenity_id}`, () => setLocationAmenity(workspace.business_id, location.id, item.amenity_id, 'remove'))} /></View>)}
          <View style={row}><TextInput value={amenityId} onChangeText={setAmenityId} placeholder="Amenity UUID" style={[input, { flex: 1 }]} /><Button label="Add amenity" onPress={() => amenityId.trim() ? run(`amenity-add:${location.id}`, async () => { await setLocationAmenity(workspace.business_id, location.id, amenityId.trim(), 'add'); setAmenityId(''); }) : undefined} /></View>
          <Text style={section}>Location media</Text>
          <Button label={busy === `upload:${location.id}` ? 'Uploading…' : 'Upload photo'} disabled={busy === `upload:${location.id}`} onPress={() => run(`upload:${location.id}`, () => pickAndUploadBusinessLocationPhoto(workspace.business_id, location.id, location.name))} />
          {locationMedia.map(item => <View key={item.id} style={{ gap: 8, borderTopWidth: 1, borderColor: '#edf1ee', paddingTop: 10 }}><Image source={{ uri: getBusinessLocationPhotoUrl(item.storage_path) }} style={{ width: '100%', height: 180, borderRadius: 14, backgroundColor: '#edf1ee' }} resizeMode="cover" /><Text>{item.caption ?? item.storage_path}</Text><View style={row}><Button label="Set featured" onPress={() => run(`featured:${item.id}`, () => setFeaturedBusinessLocationPhoto(location.id, item.id))} /><Button label="Delete" secondary onPress={() => run(`delete:${item.id}`, () => deleteBusinessLocationPhoto(workspace.business_id, item.id, item.storage_path))} /></View></View>)}
        </View>;
      })}
    </>}
  </ScrollView>;
}

const hero = { backgroundColor: '#173f2d' as const, padding: 18, borderRadius: 20, gap: 7 };
const card = { backgroundColor: 'white' as const, padding: 15, borderRadius: 16, gap: 9 };
const inner = { backgroundColor: '#f3f6f4' as const, borderRadius: 13, padding: 11, gap: 4 };
const title = { fontSize: 18, fontWeight: '800' as const };
const section = { fontWeight: '800' as const, marginTop: 4 };
const muted = { color: '#66766e' as const, lineHeight: 19 };
const input = { borderWidth: 1, borderColor: '#dce4df', borderRadius: 12, padding: 11 };
const row = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8, alignItems: 'center' as const };
const errorCard = { backgroundColor: '#fff0f0' as const, borderRadius: 14, padding: 12 };
const noticeCard = { backgroundColor: '#e6f3eb' as const, borderRadius: 14, padding: 12 };
function Button({ label, onPress, disabled, secondary = false }: { label: string; onPress: () => void | Promise<void> | undefined; disabled?: boolean; secondary?: boolean }) { return <Pressable disabled={disabled} onPress={onPress} style={{ backgroundColor: secondary ? '#edf3ef' : '#173f2d', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, opacity: disabled ? 0.5 : 1 }}><Text style={{ color: secondary ? '#244d39' : 'white', fontWeight: '800' }}>{label}</Text></Pressable>; }
function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={{ backgroundColor: active ? '#173f2d' : '#edf3ef', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 }}><Text style={{ color: active ? 'white' : '#244d39', fontWeight: '900' }}>{label}</Text></Pressable>; }
