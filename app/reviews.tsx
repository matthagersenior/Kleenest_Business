import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { getBusinessReviewDetail, replyToBusinessReview } from '@/services/business';
import { useBusinessWorkspace } from '@/state/businessWorkspace';

type ReviewRecord = {
  id?: string;
  review_id?: string;
  stars?: number;
  rating?: number;
  comment?: string | null;
  body?: string | null;
  reply?: string | null;
  business_reply?: string | null;
  location_name?: string | null;
  created_at?: string;
  [key: string]: unknown;
};

function normalizeReviewPayload(payload: Record<string, unknown> | unknown[]): ReviewRecord[] {
  if (Array.isArray(payload)) return payload.filter((item): item is ReviewRecord => Boolean(item && typeof item === 'object'));
  for (const key of ['reviews', 'items', 'rows', 'detail']) {
    const value = payload[key];
    if (Array.isArray(value)) return value.filter((item): item is ReviewRecord => Boolean(item && typeof item === 'object'));
  }
  return [];
}

export default function BusinessReviewsScreen() {
  const { workspace, refresh: refreshWorkspace } = useBusinessWorkspace();
  const [payload, setPayload] = useState<Record<string, unknown> | unknown[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!workspace) return;
    setPayload(await getBusinessReviewDetail(workspace.business_id));
  }, [workspace]);

  useEffect(() => {
    setLoading(true);
    load().catch((cause) => setError(cause instanceof Error ? cause.message : String(cause))).finally(() => setLoading(false));
  }, [load]);

  const reviews = useMemo(() => (payload ? normalizeReviewPayload(payload) : []), [payload]);

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

  async function submit(review: ReviewRecord) {
    if (!workspace) return;
    const id = String(review.id ?? review.review_id ?? '');
    const reply = drafts[id]?.trim();
    if (!id || !reply) return;
    setSavingId(id);
    setError(null);
    try {
      await replyToBusinessReview(workspace.business_id, id, reply);
      setDrafts((current) => ({ ...current, [id]: '' }));
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSavingId(null);
    }
  }

  if (loading) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} />} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
      {error ? <Text style={{ color: '#9b2c2c' }}>{error}</Text> : null}
      <View style={{ backgroundColor: 'white', padding: 15, borderRadius: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '800' }}>{reviews.length} reviews in current detail window</Text>
      </View>
      {reviews.map((review, index) => {
        const id = String(review.id ?? review.review_id ?? index);
        const rating = Number(review.stars ?? review.rating ?? 0);
        const existingReply = String(review.business_reply ?? review.reply ?? '');
        return (
          <View key={id} style={{ backgroundColor: 'white', padding: 16, borderRadius: 18, gap: 9 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <Text style={{ fontWeight: '800', fontSize: 16 }}>{String(review.location_name ?? 'Kleenest location')}</Text>
              <Text style={{ fontWeight: '800' }}>{rating ? `${rating}/5` : 'Review'}</Text>
            </View>
            <Text style={{ color: '#53645b', lineHeight: 21 }}>{String(review.comment ?? review.body ?? 'No written comment.')}</Text>
            {existingReply ? (
              <View style={{ backgroundColor: '#edf3ef', borderRadius: 12, padding: 11, gap: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#3b6751' }}>BUSINESS REPLY</Text>
                <Text style={{ color: '#40564a' }}>{existingReply}</Text>
              </View>
            ) : (
              <>
                <TextInput value={drafts[id] ?? ''} onChangeText={(value) => setDrafts((current) => ({ ...current, [id]: value }))} placeholder="Write an authorized business reply" multiline style={{ minHeight: 88, backgroundColor: '#f5f7f6', borderRadius: 12, padding: 12, textAlignVertical: 'top' }} />
                <Pressable disabled={savingId === id || !drafts[id]?.trim()} onPress={() => submit(review)} style={{ alignSelf: 'flex-start', backgroundColor: '#173f2d', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9, opacity: savingId === id ? 0.6 : 1 }}>
                  <Text style={{ color: 'white', fontWeight: '800' }}>{savingId === id ? 'Saving…' : 'Post reply'}</Text>
                </Pressable>
              </>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}
