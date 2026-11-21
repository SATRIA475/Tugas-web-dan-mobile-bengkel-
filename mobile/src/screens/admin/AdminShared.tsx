// Komponen kecil yang dipakai bersama oleh layar-layar admin.
// Dibangun di atas components/ui.tsx + theme.ts (gaya "modern bersih").
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { ChevronLeft, LogOut } from 'lucide-react-native';
import { AppHeader, IconButton } from '../../components/ui';
import { colors, radius, type } from '../../theme';

/** Header admin: logo + nama, subjudul "Panel admin", tombol keluar opsional */
export function AdminHeader({ onLogout }: { onLogout?: () => void }) {
  return (
    <AppHeader
      subtitle="Panel admin"
      right={
        onLogout ? (
          <IconButton onPress={onLogout}>
            <LogOut color={colors.foreground} size={18} />
          </IconButton>
        ) : undefined
      }
    />
  );
}

/** Tautan "Kembali" kecil di atas judul */
export function BackLink({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start', marginBottom: 14, marginLeft: -4, paddingVertical: 4 }}
    >
      <ChevronLeft color={colors.mutedForeground} size={20} />
      <Text style={[type.label, { fontSize: 14, color: colors.mutedForeground }]}>Kembali</Text>
    </TouchableOpacity>
  );
}

export function Loader() {
  return (
    <View style={{ paddingVertical: 60, alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

/** Satu baris label/nilai di kartu: label abu di kiri, nilai di kanan */
export function InfoRow({ label, value }: { label: string; value?: React.ReactNode; last?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, paddingVertical: 6 }}>
      <Text style={[type.body, { fontSize: 13.5, color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[type.label, { fontSize: 14, color: colors.foreground, flex: 1, textAlign: 'right' }]}>{value ?? '-'}</Text>
    </View>
  );
}

/** Garis putus-putus tipis (struk). borderStyle dashed hanya andal bila keempat sisi diberi border. */
export function DashedDivider({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ height: 1, overflow: 'hidden', marginVertical: 14 }, style]}>
      <View style={{ height: 4, borderWidth: 1, borderColor: colors.muted, borderStyle: 'dashed', borderRadius: 1 }} />
    </View>
  );
}

/** Kotak ikon lembut (sama seperti IconTile) */
export function IconBox({ children, bg = colors.primarySoft, size = 44 }: { children: React.ReactNode; bg?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: radius.md, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </View>
  );
}

export const formatRupiah = (n: any) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;
