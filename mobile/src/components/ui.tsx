import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TextInputProps,
  TextStyle,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { Sparkles } from 'lucide-react-native';
import { colors, radius, type, shadow } from '../theme';

/* ---------- Layout ---------- */

export function Screen({
  children,
  style,
  edges = ['top'],
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: Edge[];
}) {
  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: colors.background }, style]}>
      {children}
    </SafeAreaView>
  );
}

export function Brand({ size = 18 }: { size?: number }) {
  return (
    <Text style={[type.display, { fontSize: size, color: colors.foreground }]}>
      Satra Garage<Text style={{ color: colors.primary }}>+</Text>
    </Text>
  );
}

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <Image source={require('../../assets/logo.jpg')} style={{ width: size * 0.8, height: size * 0.8 }} resizeMode="contain" />
    </View>
  );
}

/** Header aplikasi: logo + nama, garis tipis di bawah */
export function AppHeader({ right, subtitle }: { right?: React.ReactNode; subtitle?: string }) {
  return (
    <View style={s.header}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 }}>
        <Logo />
        <View style={{ flexShrink: 1 }}>
          <Brand size={17} />
          {subtitle ? <Text style={[type.label, { fontSize: 12, color: colors.mutedForeground }]}>{subtitle}</Text> : null}
        </View>
      </View>
      {right}
    </View>
  );
}

/** Pengumuman/promo singkat (pengganti running text) */
export function Marquee({ text = 'Promo ganti oli diskon 10% · Buka setiap hari' }: { text?: string }) {
  return (
    <View style={s.notice}>
      <Sparkles color={colors.primary} size={14} />
      <Text numberOfLines={1} style={[type.label, { flex: 1, fontSize: 12.5, color: colors.primary }]}>
        {text}
      </Text>
    </View>
  );
}

/* ---------- Surfaces ---------- */

const isHighlight = (c?: string) => !!c && /dc2626|ef4444|220,\s*38,\s*38/i.test(c);

/**
 * Kartu: putih, sudut membulat, bayangan halus.
 * `highlight` (atau shadowColor merah, untuk kompatibilitas) memberi garis merah lembut.
 */
export function HardCard({
  children,
  style,
  highlight,
  shadowColor,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  highlight?: boolean;
  shadowColor?: string;
  offset?: number;
  skewDeg?: number;
}) {
  const hl = highlight ?? isHighlight(shadowColor);
  return <View style={[s.card, shadow(1), hl && { borderColor: colors.primaryBorder }, style]}>{children}</View>;
}
export const Card = HardCard;

export function SectionTitle({
  title,
  highlight,
  subtitle,
  light = false,
  align = 'left',
}: {
  title: string;
  highlight?: string;
  subtitle?: string;
  light?: boolean;
  align?: 'center' | 'left';
}) {
  const fg = light ? colors.primaryForeground : colors.foreground;
  return (
    <View style={{ alignItems: align === 'center' ? 'center' : 'flex-start', marginBottom: 18 }}>
      <Text style={[type.display, { fontSize: 24, color: fg, textAlign: align }]}>
        {title}
        {highlight ? <Text style={{ color: light ? fg : colors.primary }}> {highlight}</Text> : null}
      </Text>
      {subtitle ? (
        <Text style={[type.body, { fontSize: 14, lineHeight: 20, marginTop: 6, color: light ? 'rgba(255,255,255,0.85)' : colors.mutedForeground, textAlign: align }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

/* ---------- Controls ---------- */

type BtnVariant = 'primary' | 'outline' | 'dark';

/** Tombol utama (nama lama dipertahankan agar layar tidak perlu diubah) */
export function SkewButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  style,
  size = 'lg',
}: {
  title: string;
  onPress?: () => void;
  variant?: BtnVariant;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  size?: 'lg' | 'sm';
}) {
  const bg = variant === 'primary' ? colors.primary : variant === 'dark' ? colors.foreground : colors.card;
  const fg = variant === 'outline' ? colors.foreground : colors.primaryForeground;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        {
          backgroundColor: bg,
          borderRadius: radius.md,
          height: size === 'lg' ? 52 : 38,
          paddingHorizontal: size === 'lg' ? 20 : 14,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          opacity: disabled ? 0.5 : 1,
        },
        variant === 'outline' && { borderWidth: 1, borderColor: colors.border },
        variant === 'primary' && shadow(1),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          <Text style={[type.label, { color: fg, fontSize: size === 'lg' ? 15.5 : 13, fontWeight: '700' }]}>{title}</Text>
          {icon}
        </>
      )}
    </TouchableOpacity>
  );
}
export const Button = SkewButton;

/** Tombol ikon bulat-kotak, mis. menu / logout di header */
export function IconButton({ children, onPress, variant = 'outline' }: { children: React.ReactNode; onPress?: () => void; variant?: BtnVariant }) {
  const bg = variant === 'primary' ? colors.primary : variant === 'dark' ? colors.foreground : colors.card;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', borderWidth: variant === 'outline' ? 1 : 0, borderColor: colors.border }}
    >
      {children}
    </TouchableOpacity>
  );
}

export function Field({ label, style, ...props }: TextInputProps & { label: string }) {
  const [focus, setFocus] = useState(false);
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[type.label, { fontSize: 13, color: colors.foreground80, marginBottom: 6 }]}>{label}</Text>
      <TextInput
        placeholderTextColor="#A1A1AA"
        {...props}
        onFocus={(e) => {
          setFocus(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocus(false);
          props.onBlur?.(e);
        }}
        style={[
          {
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: focus ? colors.primary : colors.border,
            borderRadius: radius.md,
            color: colors.foreground,
            paddingHorizontal: 14,
            paddingVertical: 13,
            fontSize: 15,
          },
          style,
        ]}
      />
    </View>
  );
}

/** Pilihan yang bisa dipilih, mis. pilih kendaraan / layanan */
export function SelectChip({ label, selected, onPress, sub }: { label: string; selected?: boolean; onPress?: () => void; sub?: string }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        borderWidth: 1.5,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.primarySoft : colors.card,
        borderRadius: radius.md,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 10,
      }}
    >
      <Text style={[type.label, { fontSize: 14.5, fontWeight: '700', color: selected ? colors.primary : colors.foreground }]}>{label}</Text>
      {sub ? <Text style={[type.body, { fontSize: 12.5, marginTop: 2, color: colors.mutedForeground }]}>{sub}</Text> : null}
    </TouchableOpacity>
  );
}

/* ---------- Bits ---------- */

type Tone = 'dark' | 'primary' | 'success' | 'warning' | 'info' | 'muted';
const toneColors: Record<Tone, [string, string]> = {
  dark: [colors.secondary, colors.foreground],
  muted: [colors.secondary, colors.mutedForeground],
  primary: [colors.primarySoft, colors.primary],
  success: [colors.successSoft, colors.success],
  warning: [colors.warningSoft, colors.warning],
  info: [colors.infoSoft, colors.info],
};

export function Badge({ text, tone = 'dark', style }: { text: string; tone?: Tone; style?: StyleProp<ViewStyle> }) {
  const [bg, fg] = toneColors[tone];
  return (
    <View style={[{ backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' }, style]}>
      <Text style={[type.label, { fontSize: 11.5, color: fg }]}>{text}</Text>
    </View>
  );
}

/** Status booking → warna badge */
export function statusTone(status?: string): Tone {
  const st = (status || '').toUpperCase();
  if (st.includes('SELESAI') || st.includes('LUNAS') || st === 'DONE' || st === 'COMPLETED') return 'success';
  if (st.includes('PROSES') || st.includes('DIKERJAKAN') || st === 'IN_PROGRESS') return 'info';
  if (st.includes('BATAL') || st === 'CANCELLED') return 'primary';
  if (st.includes('MENUNGGU') || st === 'PENDING') return 'warning';
  return 'dark';
}

export function EmptyState({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <HardCard style={{ padding: 28, alignItems: 'center' }}>
      <Text style={[type.display, { fontSize: 17, color: colors.foreground, textAlign: 'center' }]}>{title}</Text>
      {desc ? <Text style={[type.body, { color: colors.mutedForeground, textAlign: 'center', marginTop: 6, lineHeight: 20 }]}>{desc}</Text> : null}
      {action ? <View style={{ marginTop: 16 }}>{action}</View> : null}
    </HardCard>
  );
}

/** Ikon dalam kotak lembut berwarna */
export function IconTile({ children, tone = 'primary', size = 44 }: { children: React.ReactNode; tone?: Tone; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: radius.md, backgroundColor: toneColors[tone][0], alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </View>
  );
}

export const textStyles: Record<string, TextStyle> = {
  muted: { ...type.body, color: colors.mutedForeground },
  label: { ...type.label, fontSize: 12.5, color: colors.mutedForeground },
};

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
