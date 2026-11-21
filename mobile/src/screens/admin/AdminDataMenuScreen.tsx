import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Users, Bike, Wrench, ChevronRight } from 'lucide-react-native';
import { Screen, Card, SectionTitle, IconTile } from '../../components/ui';
import { colors, type } from '../../theme';
import { AdminHeader } from './AdminShared';

export default function AdminDataMenuScreen({ navigation }: any) {
  const menus = [
    { id: 1, title: 'Data pelanggan', desc: 'Pengguna yang terdaftar sebagai member.', icon: Users, route: 'Pelanggan', tone: 'info' as const, fg: colors.info },
    { id: 2, title: 'Data kendaraan', desc: 'Kendaraan milik pelanggan.', icon: Bike, route: 'Kendaraan', tone: 'primary' as const, fg: colors.primary },
    { id: 3, title: 'Data layanan', desc: 'Paket servis, harga, dan estimasi waktu.', icon: Wrench, route: 'Layanan', tone: 'success' as const, fg: colors.success },
  ];

  return (
    <Screen>
      <AdminHeader />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <SectionTitle title="Master data" subtitle="Pilih kategori data yang ingin dilihat." />

        <Card>
          {menus.map((menu, i) => (
            <TouchableOpacity
              key={menu.id}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(menu.route)}
              style={[
                { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
                i > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
              ]}
            >
              <IconTile tone={menu.tone}>
                <menu.icon color={menu.fg} size={22} />
              </IconTile>
              <View style={{ flex: 1 }}>
                <Text style={[type.label, { fontSize: 15, fontWeight: '700', color: colors.foreground }]}>{menu.title}</Text>
                <Text style={[type.body, { fontSize: 13, color: colors.mutedForeground, marginTop: 2 }]}>{menu.desc}</Text>
              </View>
              <ChevronRight color={colors.mutedForeground} size={20} />
            </TouchableOpacity>
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}
