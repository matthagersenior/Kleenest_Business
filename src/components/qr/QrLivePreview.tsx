import { Image, Text, View } from 'react-native';
import qrcode from 'qrcode-generator';
import { useMemo } from 'react';
import {
  scanReadiness,
  type QrCustomizationV1,
  type QrScanFinding,
} from '@/domain/qrDesignSchema';

function parseHex(value: string) {
  return {
    r: Number.parseInt(value.slice(1, 3), 16),
    g: Number.parseInt(value.slice(3, 5), 16),
    b: Number.parseInt(value.slice(5, 7), 16),
  };
}

function toHex(value: number) {
  return Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0');
}

function mix(from: string, to: string, progress: number) {
  const a = parseHex(from);
  const b = parseHex(to);
  return `#${toHex(a.r + (b.r - a.r) * progress)}${toHex(a.g + (b.g - a.g) * progress)}${toHex(a.b + (b.b - a.b) * progress)}`;
}

function isEye(row: number, col: number, count: number) {
  return (
    (row < 7 && col < 7) ||
    (row < 7 && col >= count - 7) ||
    (row >= count - 7 && col < 7)
  );
}

function moduleRadius(style: QrCustomizationV1['design']['module_style'], size: number) {
  if (style === 'dots') return size / 2;
  if (style === 'rounded') return Math.max(1, size * 0.28);
  return 0;
}

function eyeRadius(style: QrCustomizationV1['design']['eye_style'], size: number) {
  if (style === 'circle') return size / 2;
  if (style === 'rounded') return Math.max(1, size * 0.3);
  return 0;
}

function Finding({ finding }: { finding: QrScanFinding }) {
  const blocking = finding.severity === 'blocking';
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: blocking ? '#fff0f0' : '#fff8e7',
      }}
    >
      <Text
        style={{
          color: blocking ? '#8d2929' : '#7a5714',
          fontSize: 11,
          lineHeight: 16,
          fontWeight: '700',
        }}
      >
        {blocking ? 'BLOCKING · ' : 'CHECK · '}
        {finding.message}
      </Text>
    </View>
  );
}

export function QrLivePreview({
  code,
  customization,
  businessName,
  locationName,
  size = 220,
}: {
  code: string | null;
  customization: QrCustomizationV1;
  businessName?: string | null;
  locationName?: string | null;
  size?: number;
}) {
  const matrix = useMemo(() => {
    const value = code || 'KLEENEST-PREVIEW-CODE';
    const qr = qrcode(0, 'H');
    qr.addData(value, 'Byte');
    qr.make();
    const count = qr.getModuleCount();
    const rows = Array.from({ length: count }, (_, row) =>
      Array.from({ length: count }, (_, col) => qr.isDark(row, col)),
    );
    return { rows, count };
  }, [code]);

  const findings = scanReadiness(customization);
  const quietModules = customization.design.quiet_zone;
  const totalModules = matrix.count + quietModules * 2;
  const moduleSize = size / totalModules;
  const design = customization.design;
  const frame = customization.frame;
  const logoVisible = design.logo.source !== 'none' && Boolean(design.logo.url);
  const logoSize = Math.max(0, size * design.logo.scale);

  return (
    <View style={{ gap: 10 }}>
      <View
        style={{
          backgroundColor: design.background,
          borderRadius: frame.style === 'none' ? 0 : 22,
          borderWidth: frame.style === 'none' ? 0 : 1,
          borderColor: '#d8e4dc',
          padding: 14,
          alignItems: frame.text_align === 'left' ? 'flex-start' : frame.text_align === 'right' ? 'flex-end' : 'center',
          gap: 8,
        }}
      >
        {frame.show_business_name && businessName ? (
          <Text style={{ fontSize: 11, fontWeight: '900', color: '#173f2d' }}>{businessName}</Text>
        ) : null}
        {frame.cta ? (
          <Text
            style={{
              fontSize: 16 * frame.font_scale,
              fontWeight: frame.font_weight,
              color: '#173f2d',
              textAlign: frame.text_align,
              alignSelf: 'stretch',
            }}
          >
            {frame.cta}
          </Text>
        ) : null}

        <View
          accessibilityLabel="Live QR preview"
          style={{
            width: size,
            height: size,
            backgroundColor: design.background,
            padding: quietModules * moduleSize,
            position: 'relative',
          }}
        >
          {matrix.rows.map((row, rowIndex) => (
            <View key={`r-${rowIndex}`} style={{ height: moduleSize, flexDirection: 'row' }}>
              {row.map((dark, colIndex) => {
                const eye = isEye(rowIndex, colIndex, matrix.count);
                const progress = matrix.count <= 1 ? 0 : rowIndex / (matrix.count - 1);
                const foreground = design.gradient.enabled
                  ? mix(design.gradient.from, design.gradient.to, progress)
                  : design.foreground;
                const fill = eye && design.eye_color ? design.eye_color : foreground;
                return (
                  <View
                    key={`${rowIndex}-${colIndex}`}
                    style={{
                      width: moduleSize,
                      height: moduleSize,
                      backgroundColor: dark ? fill : design.background,
                      borderRadius: dark
                        ? eye
                          ? eyeRadius(design.eye_style, moduleSize)
                          : moduleRadius(design.module_style, moduleSize)
                        : 0,
                    }}
                  />
                );
              })}
            </View>
          ))}

          {logoVisible ? (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: (size - logoSize) / 2,
                top: (size - logoSize) / 2,
                width: logoSize,
                height: logoSize,
                borderRadius: 10,
                padding: Math.min(design.logo.padding, logoSize / 4),
                backgroundColor: design.logo.background || design.background,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                source={{ uri: design.logo.url! }}
                resizeMode="contain"
                style={{ width: '100%', height: '100%' }}
              />
            </View>
          ) : null}
        </View>

        {frame.show_location_name && locationName ? (
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#4d6657' }}>{locationName}</Text>
        ) : null}
        {frame.supporting_text ? (
          <Text
            style={{
              fontSize: 11 * frame.font_scale,
              color: '#66786d',
              textAlign: frame.text_align,
              alignSelf: 'stretch',
            }}
          >
            {frame.supporting_text}
          </Text>
        ) : null}
        {frame.show_trust_badge ? (
          <View style={{ backgroundColor: '#e7f2ea', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
            <Text style={{ color: '#245a3f', fontSize: 10, fontWeight: '900' }}>KLEENEST TRUST NETWORK</Text>
          </View>
        ) : null}
      </View>

      {findings.length ? findings.map((finding) => <Finding key={finding.code} finding={finding} />) : (
        <View style={{ paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: '#edf7f0' }}>
          <Text style={{ color: '#266341', fontSize: 11, fontWeight: '800' }}>
            SCAN READY · Contrast, quiet zone, logo size and output size are inside the safe design envelope.
          </Text>
        </View>
      )}
    </View>
  );
}
