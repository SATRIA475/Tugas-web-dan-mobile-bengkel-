import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogOut, ChevronRight, CalendarClock, Car, ReceiptText } from 'lucide-react-native';
import { Screen, AppHeader, Marquee, Card, SectionTitle, IconButton, IconTile } from '../components/ui';
import { FaqList } from './LandingScreen';
import { colors, type, radius } from '../theme';

const actions = [
  { route: 'Booking', Icon: CalendarClock, title: 'Booking servis', desc: 'Buat jadwal servis tanpa antre panjang.' },
  { route: 'Kendaraan', Icon: Car, title: 'Garasi saya', desc: 'Kelola data motor Anda.' },
  { route: 'Riwayat', Icon: ReceiptText, title: 'Riwayat servis', desc: 'Lihat status dan riwayat servis.' },
];

export default function HomeScreen({ navigation }: any) {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const loadUserData = async () => {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        setUserData(JSON.parse(data));
      }
    };
    loadUserData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    // Tab ini berada di dalam stack root (Landing, Login, Register, MainApp, AdminApp)
    const stack = navigation.getParent() ?? navigation;
    stack.reset({ index: 1, routes: [{ name: 'Landing' }, { name: 'Login' }] });
  };

  return (
    <Screen>
      <AppHeader
        subtitle="Area member"
        right={
          <IconButton onPress={handleLogout}>
            <LogOut color={colors.foreground} size={19} />
          </IconButton>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Marquee />

        {/* Sapaan */}
        <View style={styles.block}>
          <Text style={[type.display, styles.greeting]}>Halo, {userData?.nama || userData?.name || 'Pelanggan'}</Text>
          <Text style={[type.body, styles.greetingSub]}>Mau servis motor hari ini? Atur jadwalnya dari sini.</Text>
        </View>

        {/* CTA booking */}
        <View style={styles.block}>
          <View style={styles.cta}>
            <Text style={[type.display, { fontSize: 20, lineHeight: 26, color: '#FFF' }]}>Booking servis tanpa antre</Text>
            <Text style={[type.body, { color: 'rgba(255,255,255,0.88)', marginTop: 6, lineHeight: 20 }]}>
              Pilih jadwal, datang tepat waktu, motor langsung ditangani mekanik.
            </Text>
            <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('Booking')} style={styles.ctaBtn}>
              <Text style={[type.label, { color: colors.primary, fontSize: 15, fontWeight: '700' }]}>Booking sekarang</Text>
              <ChevronRight color={colors.primary} size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Aksi cepat */}
        <View style={styles.block}>
          <SectionTitle title="Menu cepat" />
          <Card>
            {actions.map(({ route, Icon, title, desc }, i) => (
              <TouchableOpacity
                key={route}
                activeOpacity={0.7}
                onPress={() => navigation.navigate(route)}
                style={[styles.row, i > 0 && styles.divider]}
              >
                <IconTile>
                  <Icon color={colors.primary} size={22} />
                </IconTile>
                <View style={{ flex: 1 }}>
                  <Text style={[type.label, { fontSize: 15, fontWeight: '700', color: colors.foreground }]}>{title}</Text>
                  <Text style={[type.body, { fontSize: 13.5, color: colors.mutedForeground, marginTop: 2 }]}>{desc}</Text>
                </View>
                <ChevronRight color={colors.mutedForeground} size={20} />
              </TouchableOpacity>
            ))}
          </Card>
        </View>

        {/* FAQ */}
        <View style={styles.block}>
          <SectionTitle title="Pertanyaan umum" subtitle="Yang sering ditanyakan member." />
          <FaqList />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { paddingHorizontal: 20, paddingTop: 28 },
  greeting: { fontSize: 26, lineHeight: 32, color: colors.foreground },
  greetingSub: { fontSize: 14.5, lineHeight: 21, color: colors.mutedForeground, marginTop: 4 },
  cta: { backgroundColor: colors.primary, borderRadius: radius.xl, padding: 22 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#FFF', borderRadius: radius.md, height: 48, marginTop: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
});
