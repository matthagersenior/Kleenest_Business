import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { DataSummary } from '@/components/DataSummary';
import {
  activateEnterpriseCampaign,
  createEnterpriseCampaign,
  createEnterpriseNetwork,
  deleteEnterpriseCampaign,
  deleteEnterpriseNetwork,
  getEnterpriseControlPlaneSnapshot,
  getPartnerAllocationRoi,
  getPartnerCampaignRoi,
  inviteEnterprisePartner,
  listEnterpriseNetworkCampaigns,
  listEnterpriseNetworkMembers,
  listEnterprisePartnerBusinesses,
  listOwnedEnterpriseNetworks,
  pauseEnterpriseCampaign,
  recordEnterpriseCampaignOutcome,
  setEnterprisePartnerStatus,
  updateEnterpriseCampaign,
  updateEnterpriseNetwork,
} from '@/services/enterprise';
import { getEnterpriseOperationalPortfolio, type EnterpriseOperationalPortfolio } from '@/services/enterprisePortfolio';
import { useBusinessWorkspace } from '@/state/businessWorkspace';

type Row = Record<string, unknown>;
const idOf = (row: Row) => String(row.id ?? row.membership_id ?? '');
const nameOf = (row: Row, fallback: string) => String(row.name ?? row.business_name ?? row.title ?? fallback);

export default function EnterpriseWorkspace() {
  const { workspace, access } = useBusinessWorkspace();
  const [portfolio, setPortfolio] = useState<EnterpriseOperationalPortfolio | null>(null);
  const [snapshot, setSnapshot] = useState<Row | null>(null);
  const [networks, setNetworks] = useState<Row[]>([]);
  const [partners, setPartners] = useState<Row[]>([]);
  const [members, setMembers] = useState<Record<string, Row[]>>({});
  const [campaigns, setCampaigns] = useState<Record<string, Row[]>>({});
  const [roi, setRoi] = useState<Record<string, unknown>>({});
  const [networkName, setNetworkName] = useState('Kleenest Partner Network');
  const [partnerId, setPartnerId] = useState('');
  const [campaignName, setCampaignName] = useState('Enterprise engagement campaign');
  const [outcome, setOutcome] = useState('1');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!workspace) throw new Error('No Business workspace resolved.');
    if (!access?.enterprise_enabled) throw new Error('Enterprise entitlement is required for this workspace.');
    const [nextPortfolio, nextSnapshot, nextNetworks, nextPartners] = await Promise.all([
      getEnterpriseOperationalPortfolio(workspace.business_id),
      getEnterpriseControlPlaneSnapshot(workspace.business_id, 30),
      listOwnedEnterpriseNetworks(workspace.business_id),
      listEnterprisePartnerBusinesses(workspace.business_id),
    ]);
    setPortfolio(nextPortfolio);
    setSnapshot(nextSnapshot);
    setNetworks(nextNetworks);
    setPartners(nextPartners);
    const detail = await Promise.all(nextNetworks.map(async network => {
      const id = idOf(network);
      const [networkMembers, networkCampaigns, allocationRoi] = await Promise.all([
        listEnterpriseNetworkMembers(id),
        listEnterpriseNetworkCampaigns(id),
        getPartnerAllocationRoi(id, 30),
      ]);
      return { id, networkMembers, networkCampaigns, allocationRoi };
    }));
    setMembers(Object.fromEntries(detail.map(item => [item.id, item.networkMembers])));
    setCampaigns(Object.fromEntries(detail.map(item => [item.id, item.networkCampaigns])));
    setRoi(current => ({ ...current, ...Object.fromEntries(detail.map(item => [`network:${item.id}`, item.allocationRoi])) }));
  }, [workspace, access?.enterprise_enabled]);

  useEffect(() => {
    setLoading(true);
    load().catch(cause => setError(cause instanceof Error ? cause.message : String(cause))).finally(() => setLoading(false));
  }, [load]);

  async function refresh() {
    setRefreshing(true); setError(null);
    try { await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
    finally { setRefreshing(false); }
  }

  async function run(key: string, fn: () => Promise<unknown>) {
    setBusy(key); setError(null);
    try { await fn(); await refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
    finally { setBusy(null); }
  }

  if (loading) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" /></View>;
  if (!workspace || !access?.enterprise_enabled) return <View style={{ padding: 24, gap: 8 }}><Text style={{ fontSize: 24, fontWeight: '900' }}>Enterprise access boundary</Text><Text>Enterprise entitlement is required for this workspace.</Text></View>;

  const summary = portfolio?.summary ?? { business_count: 0, location_count: 0, open_route_count: 0, open_alert_count: 0, active_route_count: 0 };
  const activeRoutes = portfolio?.routes.filter(route => ['dispatched', 'active', 'in_progress'].includes(route.status)) ?? [];
  const routableLocations = portfolio?.locations.filter(location => location.latitude != null && location.longitude != null) ?? [];

  return <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />} contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 70 }}>
    {error ? <View style={errorCard}><Text selectable style={{ color: '#922', fontWeight: '700' }}>{error}</Text></View> : null}

    <View style={hero}>
      <Text style={{ color: '#bde4cf', fontWeight: '900', letterSpacing: 1 }}>ENTERPRISE OPERATING SYSTEM</Text>
      <Text style={{ color: 'white', fontSize: 25, fontWeight: '900' }}>{workspace.business_name ?? workspace.name ?? 'Enterprise'} portfolio</Text>
      <Text style={{ color: '#dce8e1', lineHeight: 20 }}>One operational view across partner businesses, canonical locations, Fleet routes, alerts, campaigns, outcomes and ROI.</Text>
    </View>

    <View style={row}>
      <Metric label="Businesses" value={summary.business_count} />
      <Metric label="Locations" value={summary.location_count} />
      <Metric label="Active routes" value={summary.active_route_count} />
      <Metric label="Open alerts" value={summary.open_alert_count} />
    </View>

    <Section title="Portfolio businesses" subtitle="Capability and operating scale by business">
      {portfolio?.businesses.length ? portfolio.businesses.map(business => <View key={business.id} style={card}>
        <View style={spread}><View style={{ flex: 1 }}><Text style={heading}>{business.name}</Text><Text style={muted}>{business.tier.toUpperCase()} tier</Text></View><Badge text={`${business.open_route_count} open routes`} /></View>
        <View style={row}><SmallMetric label="Locations" value={business.location_count} /><SmallMetric label="Vehicles" value={business.vehicle_count} /><SmallMetric label="Drivers" value={business.driver_count} /></View>
      </View>) : <Empty text="No businesses are in this Enterprise portfolio yet. Add partner businesses to an enabled network." />}
    </Section>

    <Section title="Fleet command" subtitle="Live routes and operational state across the portfolio">
      {activeRoutes.length ? activeRoutes.map(route => <View key={route.id} style={card}>
        <View style={spread}><View style={{ flex: 1 }}><Text style={heading}>{route.name}</Text><Text style={muted}>{route.business_name}</Text></View><Badge text={route.status.replaceAll('_', ' ')} /></View>
        <Text style={muted}>{route.stops_count} stops · {route.vehicle_name ?? 'vehicle unassigned'} · {route.driver_name ?? 'driver unassigned'}</Text>
        {route.current_lat != null && route.current_lng != null ? <Text style={muted}>Vehicle position: {Number(route.current_lat).toFixed(5)}, {Number(route.current_lng).toFixed(5)}</Text> : null}
      </View>) : <Empty text="No active routes. Planned and dispatched Fleet missions will appear here across Enterprise partner businesses." />}
    </Section>

    <Section title="Operational alerts" subtitle="Unresolved Fleet exceptions across all portfolio businesses">
      {portfolio?.alerts.length ? portfolio.alerts.slice(0, 30).map(alert => <View key={alert.id} style={card}>
        <View style={spread}><View style={{ flex: 1 }}><Text style={heading}>{alert.title}</Text><Text style={muted}>{alert.business_name} · {alert.alert_type.replaceAll('_', ' ')}</Text></View><Severity value={alert.severity} /></View>
        {alert.details ? <Text style={muted}>{alert.details}</Text> : null}
        <Text style={muted}>{new Date(alert.created_at).toLocaleString()}</Text>
      </View>) : <Empty text="No unresolved Fleet alerts in the Enterprise portfolio." />}
    </Section>

    <Section title="Location network" subtitle={`${routableLocations.length} portfolio locations have coordinates for mapping, routing and geofencing`}>
      {portfolio?.locations.length ? portfolio.locations.slice(0, 40).map(location => <View key={location.id} style={card}>
        <View style={spread}><View style={{ flex: 1 }}><Text style={heading}>{location.name}</Text><Text style={muted}>{location.business_name ?? 'Portfolio business'}</Text></View>{location.bathroom_verification_status ? <Badge text={location.bathroom_verification_status.replaceAll('_', ' ')} /> : null}</View>
        <Text style={muted}>{[location.address, location.city, location.state].filter(Boolean).join(', ') || 'Address unavailable'}</Text>
        {location.latitude != null && location.longitude != null ? <Text style={muted}>Map-ready · {Number(location.latitude).toFixed(5)}, {Number(location.longitude).toFixed(5)} · geofence {location.geofence_radius_m ?? 150} m</Text> : <Text style={{ color: '#9a651d' }}>Coordinates missing — not yet routable/geofence-ready.</Text>}
      </View>) : <Empty text="No canonical locations are attached to portfolio businesses yet." />}
    </Section>

    <Section title="Enterprise analytics" subtitle="Canonical control-plane and 30-day network state">
      <View style={card}><DataSummary value={snapshot} /></View>
    </Section>

    <Section title="Partner networks" subtitle="Organize businesses, campaigns, outcomes and allocation ROI">
      <View style={card}>
        <Text style={heading}>Create network</Text>
        <TextInput value={networkName} onChangeText={setNetworkName} style={input} />
        <Action label={busy === 'network:create' ? 'Creating…' : 'Create partner network'} disabled={Boolean(busy)} onPress={() => run('network:create', () => createEnterpriseNetwork(networkName.trim() || 'Kleenest Partner Network'))} />
      </View>

      {networks.map((network, index) => {
        const networkId = idOf(network);
        const enabled = network.enabled !== false;
        const networkMembers = members[networkId] ?? [];
        const networkCampaigns = campaigns[networkId] ?? [];
        return <View key={networkId || index} style={card}>
          <View style={spread}><View style={{ flex: 1 }}><Text style={heading}>{nameOf(network, 'Partner network')}</Text><Text style={muted}>{networkMembers.length} members · {networkCampaigns.length} campaigns</Text></View><Badge text={enabled ? 'enabled' : 'disabled'} /></View>
          <View style={row}><Action label={enabled ? 'Disable network' : 'Enable network'} secondary onPress={() => run(`network:${networkId}`, () => updateEnterpriseNetwork(networkId, nameOf(network, 'Partner network'), !enabled))} /><Action label="Delete network" secondary onPress={() => run(`network:delete:${networkId}`, () => deleteEnterpriseNetwork(networkId))} /></View>

          <Text style={subheading}>Invite partner</Text>
          <TextInput value={partnerId} onChangeText={setPartnerId} placeholder="Partner Business UUID" style={input} />
          <Action label="Invite partner business" disabled={!partnerId.trim()} onPress={() => run(`partner:${networkId}`, () => inviteEnterprisePartner(networkId, partnerId.trim()))} />

          {networkMembers.map((member, memberIndex) => {
            const membershipId = idOf(member);
            const status = String(member.status ?? 'pending');
            return <View key={membershipId || memberIndex} style={inner}>
              <Text style={{ fontWeight: '900' }}>{nameOf(member, 'Partner member')}</Text>
              <Text style={muted}>{status}</Text>
              <View style={row}><Action label="Approve" secondary onPress={() => run(`member:approve:${membershipId}`, () => setEnterprisePartnerStatus(membershipId, 'active'))} /><Action label="Suspend" secondary onPress={() => run(`member:suspend:${membershipId}`, () => setEnterprisePartnerStatus(membershipId, 'suspended'))} /></View>
            </View>;
          })}

          <Text style={subheading}>Campaigns</Text>
          <TextInput value={campaignName} onChangeText={setCampaignName} style={input} />
          <Action label="Create campaign" onPress={() => run(`campaign:create:${networkId}`, () => createEnterpriseCampaign(networkId, campaignName.trim() || 'Enterprise engagement campaign', 'engagement', 'Grow trusted restroom engagement'))} />

          {networkCampaigns.map((campaign, campaignIndex) => {
            const campaignId = idOf(campaign);
            const status = String(campaign.status ?? 'draft');
            return <View key={campaignId || campaignIndex} style={inner}>
              <View style={spread}><Text style={{ fontWeight: '900', flex: 1 }}>{nameOf(campaign, 'Campaign')}</Text><Badge text={status} /></View>
              <View style={row}><Action label={status === 'active' ? 'Pause' : 'Activate'} secondary onPress={() => run(`campaign:status:${campaignId}`, () => status === 'active' ? pauseEnterpriseCampaign(campaignId) : activateEnterpriseCampaign(campaignId))} /><Action label="Refresh name" secondary onPress={() => run(`campaign:update:${campaignId}`, () => updateEnterpriseCampaign(campaignId, { name: nameOf(campaign, 'Campaign'), status }))} /><Action label="Delete" secondary onPress={() => run(`campaign:delete:${campaignId}`, () => deleteEnterpriseCampaign(campaignId))} /><Action label="Load ROI" secondary onPress={async () => { try { const next = await getPartnerCampaignRoi(campaignId, 30); setRoi(current => ({ ...current, [`campaign:${campaignId}`]: next })); } catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); } }} /></View>
              {roi[`campaign:${campaignId}`] ? <View style={inner}><Text style={subheading}>Campaign ROI</Text><DataSummary value={roi[`campaign:${campaignId}`]} /></View> : null}
              {networkMembers[0] ? <><Text style={subheading}>Record partner outcome</Text><TextInput value={outcome} onChangeText={setOutcome} keyboardType="numeric" style={input} /><Action label="Record visits/check-ins" onPress={() => run(`outcome:${campaignId}`, () => recordEnterpriseCampaignOutcome(campaignId, String(networkMembers[0].partner_business_id ?? networkMembers[0].business_id ?? ''), { visits: Number(outcome) || 0, checkIns: Number(outcome) || 0, attributedUsers: Number(outcome) || 0 }))} /></> : null}
            </View>;
          })}

          {roi[`network:${networkId}`] ? <View style={inner}><Text style={subheading}>Allocation ROI</Text><DataSummary value={roi[`network:${networkId}`]} /></View> : null}
        </View>;
      })}
    </Section>

    <Section title="Partner candidates" subtitle="Businesses authorized for Enterprise networking">
      <View style={card}>{partners.length ? <><Text style={{ fontWeight: '900' }}>{partners.length} authorized partner candidate{partners.length === 1 ? '' : 's'}</Text><DataSummary value={partners.slice(0, 10)} /></> : <Text style={muted}>No partner candidates available.</Text>}</View>
    </Section>
  </ScrollView>;
}

const hero = { backgroundColor: '#132b21' as const, borderRadius: 20, padding: 18, gap: 6 };
const card = { backgroundColor: 'white' as const, borderRadius: 16, padding: 14, gap: 9 };
const inner = { backgroundColor: '#f3f6f4' as const, borderRadius: 13, padding: 11, gap: 7 };
const row = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8 };
const spread = { flexDirection: 'row' as const, justifyContent: 'space-between' as const, gap: 10, alignItems: 'flex-start' as const };
const input = { borderWidth: 1, borderColor: '#dce4df', borderRadius: 12, padding: 11 };
const heading = { fontSize: 18, fontWeight: '900' as const, color: '#173024' };
const subheading = { fontSize: 15, fontWeight: '900' as const, color: '#284d3a' };
const muted = { color: '#66766e' as const, lineHeight: 19 };
const errorCard = { backgroundColor: '#fff0f0' as const, borderRadius: 14, padding: 12 };
function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) { return <View style={{ gap: 9 }}><Text style={{ fontSize: 21, fontWeight: '900' }}>{title}</Text>{subtitle ? <Text style={muted}>{subtitle}</Text> : null}{children}</View>; }
function Metric({ label, value }: { label: string; value: number }) { return <View style={{ backgroundColor: 'white', borderRadius: 15, padding: 13, minWidth: 135, flexGrow: 1 }}><Text style={{ color: '#68776f' }}>{label}</Text><Text style={{ fontSize: 24, fontWeight: '900' }}>{value}</Text></View>; }
function SmallMetric({ label, value }: { label: string; value: number }) { return <View style={{ backgroundColor: '#f3f6f4', borderRadius: 12, padding: 9, minWidth: 86 }}><Text style={{ color: '#68776f', fontSize: 11 }}>{label}</Text><Text style={{ fontSize: 18, fontWeight: '900' }}>{value}</Text></View>; }
function Action({ label, onPress, disabled, secondary = false }: { label: string; onPress: () => void | Promise<void>; disabled?: boolean; secondary?: boolean }) { return <Pressable disabled={disabled} onPress={onPress} style={{ alignSelf: 'flex-start', backgroundColor: secondary ? '#edf3ef' : '#173f2d', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, opacity: disabled ? 0.5 : 1 }}><Text style={{ color: secondary ? '#244d39' : 'white', fontWeight: '900' }}>{label}</Text></Pressable>; }
function Badge({ text }: { text: string }) { return <View style={{ backgroundColor: '#e3eee7', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}><Text style={{ color: '#28533c', fontWeight: '800', fontSize: 11 }}>{text}</Text></View>; }
function Severity({ value }: { value: string }) { const severity = value.toLowerCase(); return <View style={{ backgroundColor: severity === 'critical' || severity === 'high' ? '#fff0f0' : '#fff8e8', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}><Text style={{ color: severity === 'critical' || severity === 'high' ? '#922' : '#765817', fontWeight: '900', fontSize: 11 }}>{value.toUpperCase()}</Text></View>; }
function Empty({ text }: { text: string }) { return <View style={card}><Text style={muted}>{text}</Text></View>; }
