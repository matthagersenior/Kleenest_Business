import { ScrollView, Text, View, Pressable, useWindowDimensions } from 'react-native';
import { can, effectiveBusinessPlan, type BusinessAccessContext } from '@/auth/entitlements';

const demoAccess: BusinessAccessContext = {
  plan: 'growth',
  role: 'business_owner',
  locationCount: 4,
  fleetEnabled: false,
};

const kpis = [
  { label: 'Locations', value: '4', detail: '1 needs attention' },
  { label: 'Profile completeness', value: '94%', detail: '+6% this month' },
  { label: 'Review response', value: '91%', detail: '8 awaiting reply' },
  { label: 'QR engagement', value: '1.8k', detail: '30-day scans' },
];

const management = [
  ['Business profile', 'Identity, contact, categories and public information'],
  ['Locations', 'Hours, amenities, accessibility, photos and readiness'],
  ['Reviews & engagement', 'Reply, moderate and manage customer interactions'],
  ['Campaigns & promotions', 'Promotions, campaigns, contests and events'],
  ['QR operations', 'Activation, attribution, lifecycle and redemption'],
  ['Team & permissions', 'Invite staff and manage organization roles'],
];

const intelligence = [
  ['Analytics', 'Performance, conversion, engagement and location trends'],
  ['Recommendations', 'Prioritized actions derived from canonical signals'],
  ['Reports', 'Scheduled-ready operational and executive reporting'],
  ['Audits', 'Configuration, data quality and business readiness checks'],
];

export default function BusinessControlCenter() {
  const { width } = useWindowDimensions();
  const wide = width >= 720;
  const plan = effectiveBusinessPlan(demoAccess);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 18 }}
    >
      <View style={{ gap: 6 }}>
        <Text selectable style={{ fontSize: 14, fontWeight: '700', color: '#3d6754' }}>
          KLEENEST BUSINESS · {plan.toUpperCase()}
        </Text>
        <Text selectable style={{ fontSize: 28, lineHeight: 34, fontWeight: '800', color: '#12251c' }}>
          Run the business, improve the network.
        </Text>
        <Text selectable style={{ fontSize: 16, lineHeight: 23, color: '#506158' }}>
          Management, engagement and intelligence in one business-focused control center.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {kpis.map((item) => (
          <View
            key={item.label}
            style={{
              width: wide ? '23.5%' : '48%',
              minWidth: 150,
              flexGrow: 1,
              padding: 16,
              borderRadius: 18,
              borderCurve: 'continuous',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              gap: 5,
            }}
          >
            <Text selectable style={{ fontSize: 13, fontWeight: '700', color: '#66786e' }}>{item.label}</Text>
            <Text selectable style={{ fontSize: 28, fontWeight: '800', color: '#14281e', fontVariant: ['tabular-nums'] }}>{item.value}</Text>
            <Text selectable style={{ fontSize: 12, color: '#6d7b74' }}>{item.detail}</Text>
          </View>
        ))}
      </View>

      {can(demoAccess, 'recommendations.read') && (
        <View
          style={{
            backgroundColor: '#173f2d',
            borderRadius: 22,
            borderCurve: 'continuous',
            padding: 18,
            gap: 10,
          }}
        >
          <Text selectable style={{ color: '#c8ead7', fontSize: 13, fontWeight: '800' }}>TOP RECOMMENDATION</Text>
          <Text selectable style={{ color: '#ffffff', fontSize: 20, lineHeight: 26, fontWeight: '800' }}>
            Complete accessibility details at 1 location
          </Text>
          <Text selectable style={{ color: '#dce9e2', fontSize: 14, lineHeight: 20 }}>
            Your lowest-performing location is missing accessibility attributes that are present at your other locations. Completing them improves data confidence and discovery quality.
          </Text>
          <Pressable style={{ alignSelf: 'flex-start', backgroundColor: '#ffffff', borderRadius: 999, paddingHorizontal: 15, paddingVertical: 10 }}>
            <Text style={{ fontWeight: '800', color: '#173f2d' }}>Review recommendation</Text>
          </Pressable>
        </View>
      )}

      <Section title="Management" subtitle="Authoritative business operations and engagement" items={management} wide={wide} />

      <Section title="Intelligence" subtitle="Analytics, recommendations, reports and audits" items={intelligence} wide={wide} />

      <View
        style={{
          padding: 18,
          borderRadius: 20,
          borderCurve: 'continuous',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          gap: 7,
        }}
      >
        <Text selectable style={{ fontSize: 18, fontWeight: '800', color: '#15271e' }}>Plan boundary</Text>
        <Text selectable style={{ color: '#5d6e65', lineHeight: 20 }}>
          Growth includes advanced Enterprise-class business tools for up to 5 locations. Six or more locations require Enterprise. Adding Fleet automatically unlocks the Business Enterprise capability bundle while Fleet remains a separate product entitlement.
        </Text>
      </View>
    </ScrollView>
  );
}

function Section({
  title,
  subtitle,
  items,
  wide,
}: {
  title: string;
  subtitle: string;
  items: string[][];
  wide: boolean;
}) {
  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 3 }}>
        <Text selectable style={{ fontSize: 22, fontWeight: '800', color: '#14271e' }}>{title}</Text>
        <Text selectable style={{ fontSize: 14, color: '#65746c' }}>{subtitle}</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {items.map(([name, detail]) => (
          <Pressable
            key={name}
            style={{
              width: wide ? '48%' : '100%',
              flexGrow: 1,
              padding: 16,
              borderRadius: 18,
              borderCurve: 'continuous',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              gap: 6,
            }}
          >
            <Text selectable style={{ fontSize: 17, fontWeight: '800', color: '#173024' }}>{name}</Text>
            <Text selectable style={{ color: '#66766e', lineHeight: 20 }}>{detail}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
