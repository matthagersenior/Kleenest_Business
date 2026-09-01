import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { getBusinessProfile, updateBusinessProfile } from '@/services/business';
import { useBusinessWorkspace } from '@/state/businessWorkspace';

export default function BusinessProfileScreen() {
  const { workspace, refresh } = useBusinessWorkspace();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', website: '', phone: '', email: '', logo_url: '' });

  useEffect(() => {
    if (!workspace) return;
    setLoading(true);
    getBusinessProfile(workspace.business_id)
      .then((profile) => setForm({
        name: String(profile.name ?? workspace.business_name ?? ''),
        description: String(profile.description ?? ''),
        website: String(profile.website ?? ''),
        phone: String(profile.phone ?? ''),
        email: String(profile.email ?? ''),
        logo_url: String(profile.logo_url ?? ''),
      }))
      .catch((cause) => setError(cause instanceof Error ? cause.message : String(cause)))
      .finally(() => setLoading(false));
  }, [workspace]);

  async function save() {
    if (!workspace || !form.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await updateBusinessProfile(workspace.business_id, form);
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} keyboardShouldPersistTaps="handled">
      {error ? <Text style={{ color: '#9b2c2c' }}>{error}</Text> : null}
      <Field label="Business name" value={form.name} onChangeText={(name) => setForm((current) => ({ ...current, name }))} />
      <Field label="Description" multiline value={form.description} onChangeText={(description) => setForm((current) => ({ ...current, description }))} />
      <Field label="Website" value={form.website} onChangeText={(website) => setForm((current) => ({ ...current, website }))} autoCapitalize="none" />
      <Field label="Phone" value={form.phone} onChangeText={(phone) => setForm((current) => ({ ...current, phone }))} keyboardType="phone-pad" />
      <Field label="Email" value={form.email} onChangeText={(email) => setForm((current) => ({ ...current, email }))} keyboardType="email-address" autoCapitalize="none" />
      <Field label="Logo URL" value={form.logo_url} onChangeText={(logo_url) => setForm((current) => ({ ...current, logo_url }))} autoCapitalize="none" />
      <Pressable disabled={saving || !form.name.trim()} onPress={save} style={{ backgroundColor: '#173f2d', borderRadius: 14, padding: 15, alignItems: 'center', opacity: saving ? 0.6 : 1 }}>
        <Text style={{ color: 'white', fontWeight: '800' }}>{saving ? 'Saving…' : 'Save profile'}</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, multiline, ...inputProps } = props;
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13, fontWeight: '800', color: '#53655c' }}>{label}</Text>
      <TextInput {...inputProps} multiline={multiline} style={{ minHeight: multiline ? 110 : 50, backgroundColor: 'white', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, textAlignVertical: multiline ? 'top' : 'center' }} />
    </View>
  );
}
