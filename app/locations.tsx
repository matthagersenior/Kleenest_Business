import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { listBusinessLocations, listBusinessMedia, listLocationAmenities, manageBusinessLocation, type BusinessAmenity, type BusinessLocation, type BusinessMedia } from '@/services/business';
import { useBusinessWorkspace } from '@/state/businessWorkspace';

export default function BusinessLocationsScreen() {
  const { workspace, access, refresh: refreshWorkspace } = useBusinessWorkspace();
  const [locations, setLocations] = useState<BusinessLocation[]>([]);
  const [media, setMedia] = useState<BusinessMedia[]>([]);
  const [amenities, setAmenities] = useState<Record<string, BusinessAmenity[]>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!workspace) return;
    setError(null);
    const [nextLocations, nextMedia] = await Promise.all([
      listBusinessLocations(workspace.business_id),
      listBusinessMedia(workspace.business_id),
    ]);
    const amenityEntries = await Promise.all(
      nextLocations.map(async (location) => [location.id, await listLocationAmenities(workspace.business_id, location.id)] as const),
    );
    setLocations(nextLocations);
    setMedia(nextMedia);
    setAmenities(Object.fromEntries(amenityEntries));
  }, [workspace]);

  useEffect(() => {
    setLoading(true);
    load().catch((cause) => setError(cause instanceof Error ? cause.message : String(cause))).finally(() => setLoading(false));
  }, [load]);

  async function reload() {
    setRefreshing(true);
    try {
      await Promise.all([load(), refreshWorkspace()]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setRefreshing(false);
    }
  }

  async function toggle(location: BusinessLocation) {
    if (!workspace) return;
    const active = Boolean(location.is_active ?? location.active ?? true);
    try {
      await manageBusinessLocation(workspace.business_id, location.id, active ? 'deactivate' : 'activate', {});
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }

  if (loading) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} />} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 48 }}>
      {error ? <Text style={{ color: '#9b2c2c' }}>{error}</Text> : null}
      <View style={{ backgroundColor: 'white', padding: 15, borderRadius: 16, gap: 4 }}>
        <Text style={{ fontSize: 18, fontWeight: '800' }}>{locations.length} active workspace locations</Text>
        <Text style={{ color: '#627168' }}>{access?.location_limit == null ? 'Enterprise-scale location entitlement' : `${access.location_limit} location entitlement`}</Text>
      </View>
      {locations.map((location) => {
        const active = Boolean(location.is_active ?? location.active ?? true);
        const locationMedia = media.filter((item) => item.location_id === location.id);
        const locationAmenities = amenities[location.id] ?? [];
        return (
          <View key={location.id} style={{ backgroundColor: 'white', padding: 16, borderRadius: 18, gap: 9 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={{ fontSize: 18, fontWeight: '800' }}>{location.name}</Text>
                <Text style={{ color: '#65746c' }}>{[location.address, location.city, location.state].filter(Boolean).join(', ') || 'Address not completed'}</Text>
              </View>
              <Text style={{ fontWeight: '800', color: active ? '#2f6a4e' : '#8b4a4a' }}>{active ? 'ACTIVE' : 'INACTIVE'}</Text>
            </View>
            <Text style={{ color: '#586960' }}>{locationAmenities.length} amenities · {locationMedia.length} media assets</Text>
            {locationAmenities.length > 0 ? <Text style={{ color: '#66766e' }}>{locationAmenities.slice(0, 6).map((item) => item.name).join(' · ')}</Text> : null}
            <Pressable onPress={() => toggle(location)} style={{ alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: '#edf3ef' }}>
              <Text style={{ fontWeight: '800', color: '#244d39' }}>{active ? 'Deactivate location' : 'Activate location'}</Text>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}
