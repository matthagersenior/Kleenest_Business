import { Link } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useBusinessWorkspace } from '@/state/businessWorkspace';

function readNumber(source: Record<string, unknown> | null, key: string, fallback = 0) {
  const value = source?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function readObject(source: Record<string, unknown> | null, key: string): Record<string, unknown> {
  const value = source?.[key];
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

type BusinessRoute = '/profile' | '/locations' | '/reviews' | '/engagement' | '/intelligence' | '/governance' | '/enterprise';

export default function BusinessControlCenter() {
  const { loading, refreshing, error, workspace, access, dashboard, refresh } = useBusinessWorkspace();

  if (loading) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" /></View>;
  }

  if (error || !workspace || !access) {
    return (
      <View style={{ flex: 1, padding: 24, justifyContent: 'center', gap: 14 }}>
        <Text style={{ fontSize: 26, fontWeight: '800' }}>Business access required</Text>
        <Text style={{ fontSize: 16, lineHeight: 23, color: '#5d6e65' }}>{error ?? 'No authorized Business workspace was resolved.'}</Text>
        <Pressable onPress={refresh} style={{ alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 11, borderRadius: 999, backgroundColor: '#173f2d' }}>
          <Text style={{ color: 'white', fontWeight: '800' }}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const summary = readObject(dashboard, 'summary');
  const cards = [
    { label: 'Locations', value: String(access.location_count), detail: access.location_limit == null ? 'Enterprise-scale access' : `${access.location_limit} location limit` },
    { label: 'Reviews', value: readNumber(dashboard, 'reviews').toLocaleString(), detail: 'Current 30-day window' },
    { label: 'Check-ins', value: readNumber(dashboard, 'check_ins').toLocaleString(), detail: 'Current 30-day window' },
    { label: 'Redemptions', value: readNumber(dashboard, 'redemptions').toLocaleString(), detail: 'Promotion redemptions' },
  ];
  const eventTypes = Object.keys(summary).length;
  const growthEnabled = access.plan === 'growth' || access.enterprise_enabled;

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />} contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 18 }}>
      <View style={{ gap: 5 }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: '#3d6754' }}>KLEENEST BUSINESS · {access.plan.toUpperCase()}</Text>
        <Text style={{ fontSize: 28, lineHeight: 34, fontWeight: '800', color: '#12251c' }}>{workspace.business_name ?? workspace.name ?? 'Business Control Center'}</Text>
        <Text style={{ color: '#5d6e65', fontSize: 15 }}>Live management, engagement, intelligence and governance from the shared Kleenest platform.</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {cards.map((item) => (
          <View key={item.label} style={{ minWidth: 150, flexBasis: '47%', flexGrow: 1, backgroundColor: 'white', padding: 16, borderRadius: 18, gap: 5 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#66786e' }}>{item.label}</Text>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#14281e' }}>{item.value}</Text>
            <Text style={{ fontSize: 12, color: '#6d7b74' }}>{item.detail}</Text>
          </View>
        ))}
      </View>

      {growthEnabled && (
        <View style={{ backgroundColor: '#173f2d', borderRadius: 22, padding: 18, gap: 8 }}>
          <Text style={{ color: '#c8ead7', fontSize: 13, fontWeight: '800' }}>LIVE ANALYTICS FOUNDATION</Text>
          <Text style={{ color: '#fff', fontSize: 20, lineHeight: 26, fontWeight: '800' }}>{eventTypes} analytics event categories are active in this dashboard window.</Text>
          <Text style={{ color: '#dce9e2' }}>Growth intelligence consumes the existing canonical analytics RPCs rather than a parallel metrics layer.</Text>
        </View>
      )}

      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#14271e' }}>Management</Text>
        <RouteCard href="/profile" title="Business profile" detail="Identity, contact information and public business presence" />
        <RouteCard href="/locations" title="Locations" detail="Canonical locations, amenities, active state and media inventory" />
        <RouteCard href="/reviews" title="Reviews & replies" detail="Customer review intelligence and authorized business replies" />
        <RouteCard href="/engagement" title="Engagement" detail="QR lifecycle, promotions, campaigns, contests, events, attribution and shared analytics" />
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#14271e' }}>Intelligence & governance</Text>
        {growthEnabled ? <RouteCard href="/intelligence" title="Growth Intelligence" detail="Canonical growth cockpit, benchmarks, ROI, recommendations, operations and reporting" /> : null}
        <RouteCard href="/governance" title="Governance & Trust" detail="Reporting schedules, provenance/trust quality, conflicts and service governance" />
        {access.enterprise_enabled ? <RouteCard href="/enterprise" title="Enterprise" detail="Partner networks, cross-business campaigns and Enterprise control-plane state" /> : null}
      </View>

      <View style={{ backgroundColor: 'white', borderRadius: 18, padding: 16, gap: 6 }}>
        <Text style={{ fontSize: 18, fontWeight: '800' }}>Product boundary</Text>
        <Text style={{ color: '#5d6e65', lineHeight: 20 }}>
          Fleet includes Business Standard and can monitor one location. Business Growth supports up to five Business locations. Fleet monitoring of more than one location requires Enterprise.
        </Text>
      </View>
    </ScrollView>
  );
}

function RouteCard({ href, title, detail }: { href: BusinessRoute; title: string; detail: string }) {
  return (
    <Link href={href} asChild>
      <Pressable style={{ backgroundColor: 'white', borderRadius: 18, padding: 16, gap: 5 }}>
        <Text style={{ fontSize: 17, fontWeight: '800', color: '#173024' }}>{title}</Text>
        <Text style={{ color: '#66766e', lineHeight: 20 }}>{detail}</Text>
      </Pressable>
    </Link>
  );
}
