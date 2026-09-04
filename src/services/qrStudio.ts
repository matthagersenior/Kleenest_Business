import { getSupabaseClient } from '@/lib/supabase';
import {
  defaultQrDraft,
  normalizeQrCustomization,
  type QrActionType,
  type QrCustomizationV1,
  type QrEditorDraft,
} from '@/domain/qrDesignSchema';

export type QrAsset = {
  id: string;
  business_id: string;
  location_id: string | null;
  location_name: string | null;
  location_address: string | null;
  code: string;
  label: string | null;
  active: boolean;
  purpose: string | null;
  action_type: QrActionType | string | null;
  action_payload: Record<string, unknown> | null;
  customization: Record<string, unknown> | null;
  single_use: boolean;
  max_redemptions: number | null;
  created_at: string;
  last_activity_at: string | null;
  scan_count: number;
  unique_users: number;
  redemption_count: number;
  program_count: number;
  version_count: number;
};

export type QrVersion = {
  id: string;
  qr_code_id: string;
  business_id: string;
  version: number;
  snapshot: Record<string, unknown>;
  change_summary: string | null;
  created_by: string | null;
  created_at: string;
};

export type QrTemplate = {
  id: string;
  owner_business_id: string | null;
  name: string;
  description: string | null;
  design: Record<string, unknown>;
  default_action: Record<string, unknown> | null;
  scope: 'system' | 'business' | 'enterprise_network';
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type QrEngagementProgram = {
  id: string;
  qr_code_id: string;
  program_type: string;
  name: string;
  description: string | null;
  trigger_count: number;
  reward_config: Record<string, unknown>;
  active: boolean;
  created_at?: string;
};

export type QrAnalytics = {
  qr_scans?: number;
  check_ins?: number;
  unique_users?: number;
  locations?: number;
  locations_with_scans?: number;
  by_location?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

const client = () => getSupabaseClient();

function errorMessage(error: { message?: string; details?: string; hint?: string } | null) {
  if (!error) return null;
  const source = [error.message, error.details, error.hint].filter(Boolean).join(' · ');
  if (/business management access required/i.test(source)) {
    return 'You do not have permission to manage QR assets for this Business workspace.';
  }
  if (/location does not belong/i.test(source)) {
    return 'Choose an active location owned or claimed by this Business workspace.';
  }
  if (/quiet zone/i.test(source)) {
    return 'Increase the QR quiet zone before saving this design.';
  }
  if (/external qr actions/i.test(source)) {
    return 'External QR destinations must use a valid HTTPS URL.';
  }
  return source || 'QR Studio request failed.';
}

function unwrap<T>(data: T | null, error: { message?: string; details?: string; hint?: string } | null): T {
  if (error) throw new Error(errorMessage(error) ?? 'QR Studio request failed.');
  if (data == null) throw new Error('QR Studio returned no data.');
  return data;
}

function number(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function listQrAssets(businessId: string, days = 30): Promise<QrAsset[]> {
  const end = new Date();
  const start = new Date(end.getTime() - days * 86_400_000);
  const { data, error } = await client().rpc('qr_studio_list_assets', {
    p_business_id: businessId,
    p_from: start.toISOString(),
    p_to: end.toISOString(),
  });
  const rows = unwrap((data ?? []) as unknown as QrAsset[], error);
  return rows.map((row) => ({
    ...row,
    scan_count: number(row.scan_count),
    unique_users: number(row.unique_users),
    redemption_count: number(row.redemption_count),
    program_count: number(row.program_count),
    version_count: number(row.version_count),
  }));
}

export function qrAssetToDraft(asset: QrAsset): QrEditorDraft {
  const actionType = (asset.action_type || 'checkin') as QrActionType;
  return {
    id: asset.id,
    code: asset.code,
    label: asset.label || 'Kleenest QR',
    business_id: asset.business_id,
    location_id: asset.location_id,
    customization: normalizeQrCustomization(asset.customization),
    action: {
      type: actionType,
      purpose: asset.purpose || actionType,
      payload: asset.action_payload ?? {},
    },
    lifecycle: {
      active: asset.active,
      single_use: asset.single_use,
      max_redemptions: asset.max_redemptions,
    },
  };
}

export function newQrDraft(businessId: string, locationId: string | null) {
  return defaultQrDraft(businessId, locationId);
}

export async function saveQrAsset(
  draft: QrEditorDraft,
  changeSummary = 'Updated in QR Studio',
): Promise<QrAsset & { version?: number }> {
  const { data, error } = await client().rpc('qr_studio_upsert_asset', {
    p_business_id: draft.business_id,
    p_qr_id: draft.id,
    p_location_id: draft.location_id,
    p_patch: {
      label: draft.label,
      active: draft.lifecycle.active,
      purpose: draft.action.purpose,
      action_type: draft.action.type,
      action_payload: draft.action.payload,
      customization: draft.customization,
      single_use: draft.lifecycle.single_use,
      max_redemptions: draft.lifecycle.max_redemptions,
    },
    p_change_summary: changeSummary,
  });
  return unwrap(data as (QrAsset & { version?: number }) | null, error);
}

export async function setQrActive(businessId: string, qrId: string, active: boolean) {
  const { data, error } = await client().rpc('business_set_qr_active', {
    p_business_id: businessId,
    p_qr_id: qrId,
    p_active: active,
  });
  return unwrap(data, error);
}

export async function listQrVersions(businessId: string, qrId: string): Promise<QrVersion[]> {
  const { data, error } = await client().rpc('qr_studio_versions', {
    p_business_id: businessId,
    p_qr_id: qrId,
  });
  return unwrap((data ?? []) as QrVersion[], error);
}

export async function restoreQrVersion(businessId: string, qrId: string, version: number) {
  const { data, error } = await client().rpc('qr_studio_restore_version', {
    p_business_id: businessId,
    p_qr_id: qrId,
    p_version: version,
    p_change_summary: `Restored QR Studio version ${version}`,
  });
  return unwrap(data as QrAsset | null, error);
}

export async function listQrTemplates(businessId: string): Promise<QrTemplate[]> {
  const { data, error } = await client().rpc('qr_studio_list_templates', {
    p_business_id: businessId,
  });
  return unwrap((data ?? []) as QrTemplate[], error);
}

export async function saveQrTemplate(input: {
  businessId: string;
  templateId?: string | null;
  name: string;
  description?: string | null;
  customization: QrCustomizationV1;
  defaultAction?: Record<string, unknown> | null;
}) {
  const { data, error } = await client().rpc('qr_studio_save_template', {
    p_business_id: input.businessId,
    p_template_id: input.templateId ?? null,
    p_name: input.name,
    p_description: input.description ?? null,
    p_design: input.customization,
    p_default_action: input.defaultAction ?? null,
  });
  return unwrap(data as QrTemplate | null, error);
}

export async function archiveQrTemplate(businessId: string, templateId: string) {
  const { data, error } = await client().rpc('qr_studio_archive_template', {
    p_business_id: businessId,
    p_template_id: templateId,
  });
  return unwrap(Boolean(data), error);
}

export async function getQrAnalytics(businessId: string, days = 30): Promise<QrAnalytics> {
  const end = new Date();
  const start = new Date(end.getTime() - days * 86_400_000);
  const { data, error } = await client().rpc('business_qr_analytics', {
    p_business_id: businessId,
    p_start: start.toISOString(),
    p_end: end.toISOString(),
  });
  return unwrap((data ?? {}) as QrAnalytics, error);
}

export async function listQrEngagementPrograms(qrId: string): Promise<QrEngagementProgram[]> {
  const { data, error } = await client().rpc('list_qr_engagement_programs', {
    p_qr_code_id: qrId,
  });
  return unwrap((data ?? []) as QrEngagementProgram[], error);
}

export async function createQrEngagementProgram(input: {
  qrId: string;
  programType: string;
  name: string;
  description?: string | null;
  triggerCount?: number;
  rewardConfig?: Record<string, unknown>;
}) {
  const { data, error } = await client().rpc('create_qr_engagement_program', {
    p_qr_code_id: input.qrId,
    p_program_type: input.programType,
    p_name: input.name,
    p_description: input.description ?? null,
    p_reward_config: input.rewardConfig ?? {},
    p_trigger_count: input.triggerCount ?? 1,
  });
  return unwrap(data as string | null, error);
}
