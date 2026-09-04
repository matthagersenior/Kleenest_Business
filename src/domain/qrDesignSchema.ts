export const QR_CUSTOMIZATION_SCHEMA_VERSION = 1 as const;

export type QrModuleStyle = 'square' | 'rounded' | 'dots';
export type QrEyeStyle = 'square' | 'rounded' | 'circle';
export type QrLogoSource = 'none' | 'business' | 'kleenest' | 'media';
export type QrFrameStyle = 'none' | 'rounded-card' | 'badge' | 'ticket' | 'sign';
export type QrTextAlign = 'left' | 'center' | 'right';

export type QrLogoDesign = {
  source: QrLogoSource;
  url: string | null;
  scale: number;
  padding: number;
  background: string | null;
};

export type QrDesign = {
  foreground: string;
  background: string;
  gradient: {
    enabled: boolean;
    from: string;
    to: string;
    angle: number;
  };
  module_style: QrModuleStyle;
  eye_style: QrEyeStyle;
  eye_color: string | null;
  quiet_zone: number;
  output_size: number;
  logo: QrLogoDesign;
};

export type QrFrame = {
  style: QrFrameStyle;
  cta: string | null;
  supporting_text: string | null;
  text_align: QrTextAlign;
  font_scale: number;
  font_weight: '500' | '600' | '700' | '800' | '900';
  show_business_name: boolean;
  show_location_name: boolean;
  show_trust_badge: boolean;
};

export type QrCustomizationV1 = {
  schema_version: 1;
  design: QrDesign;
  frame: QrFrame;
  brand: Record<string, unknown>;
};

export type QrActionType =
  | 'checkin'
  | 'location_details'
  | 'review'
  | 'directions'
  | 'route_add'
  | 'promotion_redeem'
  | 'contest_entry'
  | 'game_entry'
  | 'loyalty'
  | 'reward'
  | 'event_entry'
  | 'reverify'
  | 'trust_mission'
  | 'premium_redeem'
  | 'fleet_checkpoint'
  | 'enterprise_campaign'
  | 'kleenest_deep_link'
  | 'external_url';

export type QrActionDraft = {
  type: QrActionType;
  purpose: string;
  payload: Record<string, unknown>;
};

export type QrLifecycleDraft = {
  active: boolean;
  single_use: boolean;
  max_redemptions: number | null;
};

export type QrScanFinding = {
  code: 'contrast' | 'quiet_zone' | 'logo_scale' | 'output_size';
  severity: 'warning' | 'blocking';
  message: string;
};

export type QrEditorDraft = {
  id: string | null;
  code: string | null;
  label: string;
  business_id: string;
  location_id: string | null;
  customization: QrCustomizationV1;
  action: QrActionDraft;
  lifecycle: QrLifecycleDraft;
};

export const QR_ACTION_OPTIONS: ReadonlyArray<{
  value: QrActionType;
  label: string;
  description: string;
}> = [
  { value: 'checkin', label: 'Check in', description: 'Record a trusted Kleenest visit/check-in.' },
  { value: 'location_details', label: 'Location details', description: 'Open the canonical location details screen.' },
  { value: 'review', label: 'Leave a review', description: 'Open the review/contribution flow.' },
  { value: 'directions', label: 'Directions', description: 'Start navigation to this location.' },
  { value: 'route_add', label: 'Add to route', description: 'Add the location to a Kleenest route.' },
  { value: 'promotion_redeem', label: 'Promotion', description: 'Open or redeem a linked promotion.' },
  { value: 'contest_entry', label: 'Contest', description: 'Enter or progress a linked contest.' },
  { value: 'game_entry', label: 'Game', description: 'Open a Kleenest game or game objective.' },
  { value: 'loyalty', label: 'Loyalty', description: 'Advance a loyalty or repeat-visit program.' },
  { value: 'reward', label: 'Reward', description: 'Open or redeem a Kleenest reward.' },
  { value: 'event_entry', label: 'Event', description: 'Open or check into a linked event.' },
  { value: 'reverify', label: 'Reverify restroom', description: 'Launch a trust/reverification contribution.' },
  { value: 'trust_mission', label: 'Trust mission', description: 'Advance a verification or trust-network mission.' },
  { value: 'premium_redeem', label: 'Premium benefit', description: 'Open an eligible premium-user benefit.' },
  { value: 'fleet_checkpoint', label: 'Fleet checkpoint', description: 'Record or open an authorized Fleet checkpoint.' },
  { value: 'enterprise_campaign', label: 'Enterprise campaign', description: 'Open a linked Enterprise campaign experience.' },
  { value: 'kleenest_deep_link', label: 'Kleenest deep link', description: 'Open an approved Kleenest app destination.' },
  { value: 'external_url', label: 'External website', description: 'Open an approved HTTPS destination.' },
];

const HEX = /^#[0-9a-f]{6}$/i;

export function defaultQrCustomization(): QrCustomizationV1 {
  return {
    schema_version: QR_CUSTOMIZATION_SCHEMA_VERSION,
    design: {
      foreground: '#173f2d',
      background: '#ffffff',
      gradient: {
        enabled: false,
        from: '#173f2d',
        to: '#2f7a57',
        angle: 45,
      },
      module_style: 'square',
      eye_style: 'square',
      eye_color: null,
      quiet_zone: 4,
      output_size: 1024,
      logo: {
        source: 'none',
        url: null,
        scale: 0,
        padding: 8,
        background: '#ffffff',
      },
    },
    frame: {
      style: 'rounded-card',
      cta: 'Scan with Kleenest',
      supporting_text: null,
      text_align: 'center',
      font_scale: 1,
      font_weight: '800',
      show_business_name: true,
      show_location_name: true,
      show_trust_badge: false,
    },
    brand: {},
  };
}

export function defaultQrAction(): QrActionDraft {
  return { type: 'checkin', purpose: 'checkin', payload: {} };
}

export function defaultQrDraft(businessId: string, locationId: string | null = null): QrEditorDraft {
  return {
    id: null,
    code: null,
    label: 'Business location entrance',
    business_id: businessId,
    location_id: locationId,
    customization: defaultQrCustomization(),
    action: defaultQrAction(),
    lifecycle: { active: true, single_use: false, max_redemptions: null },
  };
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function text(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function hex(value: unknown, fallback: string) {
  const candidate = text(value, fallback);
  return HEX.test(candidate) ? candidate : fallback;
}

function boundedNumber(value: unknown, fallback: number, min: number, max: number) {
  const candidate = Number(value);
  return Number.isFinite(candidate) ? Math.min(max, Math.max(min, candidate)) : fallback;
}

export function normalizeQrCustomization(value: unknown): QrCustomizationV1 {
  const defaults = defaultQrCustomization();
  const root = asObject(value);

  // Legacy customization values are kept as brand metadata while the new visual design
  // receives safe defaults. This makes old printed codes immediately editable.
  if (Number(root.schema_version) !== 1) {
    return { ...defaults, brand: root };
  }

  const design = asObject(root.design);
  const gradient = asObject(design.gradient);
  const logo = asObject(design.logo);
  const frame = asObject(root.frame);

  const moduleStyle = text(design.module_style, defaults.design.module_style);
  const eyeStyle = text(design.eye_style, defaults.design.eye_style);
  const logoSource = text(logo.source, defaults.design.logo.source);
  const frameStyle = text(frame.style, defaults.frame.style);
  const align = text(frame.text_align, defaults.frame.text_align);
  const weight = text(frame.font_weight, defaults.frame.font_weight);

  return {
    schema_version: 1,
    design: {
      foreground: hex(design.foreground, defaults.design.foreground),
      background: hex(design.background, defaults.design.background),
      gradient: {
        enabled: Boolean(gradient.enabled),
        from: hex(gradient.from, defaults.design.gradient.from),
        to: hex(gradient.to, defaults.design.gradient.to),
        angle: boundedNumber(gradient.angle, 45, 0, 360),
      },
      module_style: ['square', 'rounded', 'dots'].includes(moduleStyle)
        ? (moduleStyle as QrModuleStyle)
        : defaults.design.module_style,
      eye_style: ['square', 'rounded', 'circle'].includes(eyeStyle)
        ? (eyeStyle as QrEyeStyle)
        : defaults.design.eye_style,
      eye_color:
        typeof design.eye_color === 'string' && HEX.test(design.eye_color)
          ? design.eye_color
          : null,
      quiet_zone: boundedNumber(design.quiet_zone, 4, 4, 12),
      output_size: boundedNumber(design.output_size, 1024, 256, 4096),
      logo: {
        source: ['none', 'business', 'kleenest', 'media'].includes(logoSource)
          ? (logoSource as QrLogoSource)
          : 'none',
        url: typeof logo.url === 'string' && logo.url.trim() ? logo.url : null,
        scale: boundedNumber(logo.scale, 0, 0, 0.22),
        padding: boundedNumber(logo.padding, 8, 0, 32),
        background:
          typeof logo.background === 'string' && HEX.test(logo.background)
            ? logo.background
            : null,
      },
    },
    frame: {
      style: ['none', 'rounded-card', 'badge', 'ticket', 'sign'].includes(frameStyle)
        ? (frameStyle as QrFrameStyle)
        : defaults.frame.style,
      cta: typeof frame.cta === 'string' ? frame.cta : defaults.frame.cta,
      supporting_text:
        typeof frame.supporting_text === 'string' ? frame.supporting_text : null,
      text_align: ['left', 'center', 'right'].includes(align)
        ? (align as QrTextAlign)
        : defaults.frame.text_align,
      font_scale: boundedNumber(frame.font_scale, 1, 0.75, 1.75),
      font_weight: ['500', '600', '700', '800', '900'].includes(weight)
        ? (weight as QrFrame['font_weight'])
        : defaults.frame.font_weight,
      show_business_name: frame.show_business_name !== false,
      show_location_name: frame.show_location_name !== false,
      show_trust_badge: Boolean(frame.show_trust_badge),
    },
    brand: asObject(root.brand),
  };
}

function rgb(hexColor: string) {
  return {
    r: Number.parseInt(hexColor.slice(1, 3), 16),
    g: Number.parseInt(hexColor.slice(3, 5), 16),
    b: Number.parseInt(hexColor.slice(5, 7), 16),
  };
}

function relativeLuminance(hexColor: string) {
  const value = rgb(hexColor);
  const channels = [value.r, value.g, value.b].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function contrastRatio(foreground: string, background: string) {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const light = Math.max(a, b);
  const dark = Math.min(a, b);
  return (light + 0.05) / (dark + 0.05);
}

export function scanReadiness(customization: QrCustomizationV1): QrScanFinding[] {
  const findings: QrScanFinding[] = [];
  const ratio = contrastRatio(
    customization.design.foreground,
    customization.design.background,
  );
  if (ratio < 3) {
    findings.push({
      code: 'contrast',
      severity: 'blocking',
      message: `Foreground/background contrast is ${ratio.toFixed(1)}:1; use a darker code or lighter background.`,
    });
  } else if (ratio < 4.5) {
    findings.push({
      code: 'contrast',
      severity: 'warning',
      message: `Contrast is ${ratio.toFixed(1)}:1. Higher contrast improves scanning on printed signs.`,
    });
  }
  if (customization.design.quiet_zone < 4) {
    findings.push({
      code: 'quiet_zone',
      severity: 'blocking',
      message: 'QR quiet zone must be at least 4 modules.',
    });
  }
  if (customization.design.logo.scale > 0.2) {
    findings.push({
      code: 'logo_scale',
      severity: 'warning',
      message: 'The center logo is large; test the printed code before wide distribution.',
    });
  }
  if (customization.design.output_size < 512) {
    findings.push({
      code: 'output_size',
      severity: 'warning',
      message: 'Use at least a 512px export for signage and print layouts.',
    });
  }
  return findings;
}

export function hasBlockingScanFinding(customization: QrCustomizationV1) {
  return scanReadiness(customization).some((finding) => finding.severity === 'blocking');
}

export function qrDestination(code: string) {
  return `https://kleenest.app/q/${encodeURIComponent(code)}`;
}
