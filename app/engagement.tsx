import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { getEngagementBundle, listCampaigns, listContests, listEvents, manageCampaign, manageContest, manageEvent, managePromotion, manageQr, type EngagementRecord } from '@/services/engagement';
import { listBusinessLocations } from '@/services/business';
import { useBusinessWorkspace } from '@/state/businessWorkspace';

type Bundle = Awaited<ReturnType<typeof getEngagementBundle>>;

function arrayFrom(value: unknown): EngagementRecord[] {
  if (Array.isArray(value)) return value.filter((item): item is EngagementRecord => Boolean(item && typeof item === 'object'));
  if (value && typeof value === 'object') {
    for (const key of ['items', 'rows', 'campaigns', 'events', 'promotions', 'qr_codes', 'qrs', 'detail']) {
      const nested = (value as Record<string, unknown>)[key];
      if (Array.isArray(nested)) return nested.filter((item): item is EngagementRecord => Boolean(item && typeof item === 'object'));
    }
  }
  return [];
}

function titleOf(item: EngagementRecord, fallback: string) {
  return String(item.title ?? item.name ?? item.label ?? fallback);
}

export default function BusinessEngagementScreen() {
  const { workspace, refresh: refreshWorkspace } = useBusinessWorkspace();
  const [campaigns, setCampaigns] = useState<EngagementRecord[]>([]);
  const [contests, setContests] = useState<EngagementRecord[]>([]);
  const [events, setEvents] = useState<EngagementRecord[]>([]);
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [firstLocationId, setFirstLocationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!workspace) return;
    const businessId = workspace.business_id;
    const [nextCampaigns, nextContests, nextEvents, nextBundle, locations] = await Promise.all([
      listCampaigns(businessId),
      listContests(businessId),
      listEvents(businessId),
      getEngagementBundle(businessId),
      listBusinessLocations(businessId),
    ]);
    setCampaigns(nextCampaigns);
    setContests(nextContests);
    setEvents(nextEvents);
    setBundle(nextBundle);
    setFirstLocationId(locations[0]?.id ?? null);
  }, [workspace]);

  useEffect(() => {
    setLoading(true);
    load().catch((cause) => setError(cause instanceof Error ? cause.message : String(cause))).finally(() => setLoading(false));
  }, [load]);

  const promotions = useMemo(() => arrayFrom(bundle?.promotions), [bundle]);
  const qrs = useMemo(() => arrayFrom(bundle?.qr), [bundle]);

  async function reload() {
    setRefreshing(true);
    setError(null);
    try {
      await Promise.all([load(), refreshWorkspace()]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setRefreshing(false);
    }
  }

  async function run(key: string, action: () => Promise<unknown>) {
    setBusy(key);
    setError(null);
    try {
      await action();
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;
  if (!workspace) return <View style={{ padding: 20 }}><Text>Business workspace required.</Text></View>;

  const businessId = workspace.business_id;

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} />} contentContainerStyle={{ padding: 16, gap: 18, paddingBottom: 56 }}>
      {error ? <Text style={{ color: '#9b2c2c' }}>{error}</Text> : null}

      <View style={{ backgroundColor: '#173f2d', borderRadius: 20, padding: 18, gap: 8 }}>
        <Text style={{ color: '#c8ead7', fontSize: 12, fontWeight: '800' }}>CANONICAL ENGAGEMENT</Text>
        <Text style={{ color: 'white', fontSize: 22, fontWeight: '800' }}>QR, campaigns, promotions, contests and events</Text>
        <Text style={{ color: '#dce9e2', lineHeight: 20 }}>All mutations and analytics use the existing shared Kleenest Supabase contracts so Production sees the same network outcomes.</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <Metric label="Campaigns" value={campaigns.length} />
        <Metric label="Contests" value={contests.length} />
        <Metric label="Events" value={events.length} />
        <Metric label="Promotions" value={promotions.length} />
        <Metric label="QR codes" value={qrs.length} />
      </View>

      <Section title="Campaigns">
        <Action label="Create campaign" busy={busy === 'campaign-create'} onPress={() => run('campaign-create', () => manageCampaign(businessId, null, 'create', { name: 'New Kleenest campaign', status: 'draft' }))} />
        {campaigns.map((item, index) => {
          const id = String(item.id ?? '');
          const status = String(item.status ?? 'draft');
          return <RecordCard key={id || index} title={titleOf(item, 'Campaign')} detail={status} actionLabel={status === 'active' ? 'Pause' : 'Activate'} disabled={!id || busy === `campaign-${id}`} onAction={() => run(`campaign-${id}`, () => manageCampaign(businessId, id, status === 'active' ? 'pause' : 'activate'))} />;
        })}
      </Section>

      <Section title="Contests">
        <Action label="Create contest" busy={busy === 'contest-create'} onPress={() => run('contest-create', () => manageContest(businessId, null, 'create', { name: 'Kleenest community contest', scoring_rules: {}, rewards: {} }))} />
        {contests.map((item, index) => {
          const id = String(item.id ?? '');
          const status = String(item.status ?? 'draft');
          return <RecordCard key={id || index} title={titleOf(item, 'Contest')} detail={status} actionLabel={status === 'active' ? 'Pause' : 'Activate'} disabled={!id || busy === `contest-${id}`} onAction={() => run(`contest-${id}`, () => manageContest(businessId, id, status === 'active' ? 'pause' : 'activate'))} />;
        })}
      </Section>

      <Section title="Events">
        <Action label="Create event" busy={busy === 'event-create'} onPress={() => run('event-create', () => manageEvent(businessId, null, 'create', { title: 'New Kleenest event', location_id: firstLocationId }))} />
        {events.map((item, index) => {
          const id = String(item.id ?? '');
          return <RecordCard key={id || index} title={titleOf(item, 'Event')} detail={String(item.event_date ?? item.status ?? 'Scheduled')} actionLabel="Delete" disabled={!id || busy === `event-${id}`} onAction={() => run(`event-${id}`, () => manageEvent(businessId, id, 'delete'))} />;
        })}
      </Section>

      <Section title="Promotions">
        <Action label="Create promotion" busy={busy === 'promotion-create'} onPress={() => run('promotion-create', () => managePromotion(businessId, null, 'create', { title: 'New Kleenest promotion', location_id: firstLocationId, active: true }))} />
        {promotions.map((item, index) => {
          const id = String(item.id ?? '');
          return <RecordCard key={id || index} title={titleOf(item, 'Promotion')} detail={item.active === false ? 'Inactive' : 'Active'} actionLabel="Deactivate" disabled={!id || item.active === false || busy === `promotion-${id}`} onAction={() => run(`promotion-${id}`, () => managePromotion(businessId, id, 'deactivate'))} />;
        })}
      </Section>

      <Section title="QR lifecycle">
        <Action label="Create location QR" busy={busy === 'qr-create'} disabled={!firstLocationId} onPress={() => run('qr-create', () => manageQr(businessId, firstLocationId, null, 'create', { label: 'Kleenest location QR', customization: {} }))} />
        {qrs.map((item, index) => {
          const id = String(item.id ?? '');
          return <RecordCard key={id || index} title={titleOf(item, 'Location QR')} detail={item.active === false ? 'Inactive' : String(item.code ?? 'Active')} actionLabel="Deactivate" disabled={!id || item.active === false || busy === `qr-${id}`} onAction={() => run(`qr-${id}`, () => manageQr(businessId, item.location_id ? String(item.location_id) : null, id, 'deactivate'))} />;
        })}
      </Section>
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <View style={{ minWidth: 110, flexGrow: 1, backgroundColor: 'white', borderRadius: 16, padding: 14, gap: 3 }}><Text style={{ color: '#66766e', fontSize: 12, fontWeight: '700' }}>{label}</Text><Text style={{ fontSize: 24, fontWeight: '800' }}>{value}</Text></View>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={{ gap: 10 }}><Text style={{ fontSize: 21, fontWeight: '800' }}>{title}</Text>{children}</View>;
}

function Action({ label, onPress, busy, disabled }: { label: string; onPress: () => void; busy?: boolean; disabled?: boolean }) {
  return <Pressable onPress={onPress} disabled={busy || disabled} style={{ alignSelf: 'flex-start', backgroundColor: '#173f2d', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, opacity: busy || disabled ? 0.5 : 1 }}><Text style={{ color: 'white', fontWeight: '800' }}>{busy ? 'Working…' : label}</Text></Pressable>;
}

function RecordCard({ title, detail, actionLabel, onAction, disabled }: { title: string; detail: string; actionLabel: string; onAction: () => void; disabled?: boolean }) {
  return <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 14, gap: 8 }}><View style={{ gap: 3 }}><Text style={{ fontSize: 16, fontWeight: '800' }}>{title}</Text><Text style={{ color: '#64736b' }}>{detail}</Text></View><Pressable onPress={onAction} disabled={disabled} style={{ alignSelf: 'flex-start', backgroundColor: '#edf3ef', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, opacity: disabled ? 0.5 : 1 }}><Text style={{ fontWeight: '800', color: '#244d39' }}>{actionLabel}</Text></Pressable></View>;
}
