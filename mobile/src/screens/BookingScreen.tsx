import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../utils/api';
import { requireUser } from '../utils/session';
import { Info } from 'lucide-react-native';
import { Screen, AppHeader, Card, SectionTitle, Button, Field, SelectChip } from '../components/ui';
import { colors, type, radius } from '../theme';

type Layanan = { id: string; nama_layanan: string; harga: number | string; estimasi_waktu?: number };
type Kendaraan = { id: string; plat_nomor: string; merk: string; tipe: string; tahun?: number };

const rupiah = (n: number | string) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

export default function BookingScreen({ navigation }: any) {
  const [layanan, setLayanan] = useState<Layanan[]>([]);
  const [vehicles, setVehicles] = useState<Kendaraan[]>([]);
  const [layananId, setLayananId] = useState<string | null>(null);
  const [kendaraanId, setKendaraanId] = useState<string | null>(null);
  // Dipakai jika pengguna belum punya kendaraan terdaftar (backend akan membuatkannya)
  const [plat, setPlat] = useState('');
  const [merk, setMerk] = useState('');
  const [tipe, setTipe] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [keluhan, setKeluhan] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const user = await requireUser(navigation);
        if (!user) return;
        setLoadingData(true);
        try {
          const [resLayanan, resVehicles] = await Promise.all([
            api.get('/booking/layanan'),
            api.get(`/customer/vehicles/${user.id}`),
          ]);
          if (!active) return;
          const listLayanan: Layanan[] = Array.isArray(resLayanan.data) ? resLayanan.data : [];
          const listVehicles: Kendaraan[] = Array.isArray(resVehicles.data) ? resVehicles.data : [];
          setLayanan(listLayanan);
          setVehicles(listVehicles);
          setLayananId((cur) => (cur && listLayanan.some((l) => l.id === cur) ? cur : listLayanan[0]?.id ?? null));
          setKendaraanId((cur) => (cur && listVehicles.some((v) => v.id === cur) ? cur : listVehicles[0]?.id ?? null));
        } catch (error) {
          console.error('Gagal memuat data booking:', error);
          if (active) Alert.alert('Gagal', 'Data layanan atau kendaraan tidak bisa dimuat. Periksa koneksi ke server.');
        } finally {
          if (active) setLoadingData(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [navigation])
  );

  const handleBooking = async () => {
    const user = await requireUser(navigation);
    if (!user) return;

    if (!layananId) {
      Alert.alert('Error', 'Pilih layanan terlebih dahulu.');
      return;
    }

    const kendaraan = vehicles.find((v) => v.id === kendaraanId);
    const dataKendaraan = kendaraan
      ? { plat_nomor: kendaraan.plat_nomor, merk_kendaraan: kendaraan.merk, tipe_kendaraan: kendaraan.tipe }
      : { plat_nomor: plat.trim().toUpperCase(), merk_kendaraan: merk.trim(), tipe_kendaraan: tipe.trim() };
    if (!dataKendaraan.plat_nomor || !dataKendaraan.merk_kendaraan || !dataKendaraan.tipe_kendaraan) {
      Alert.alert('Error', 'Lengkapi data kendaraan (plat nomor, merk, dan tipe).');
      return;
    }

    // Format yang diterima: "YYYY-MM-DD HH:MM"
    const match = tanggal.trim().match(/^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}):(\d{2})$/);
    const parsed = match ? new Date(`${match[1]}T${match[2].padStart(2, '0')}:${match[3]}:00`) : null;
    if (!match || !parsed || isNaN(parsed.getTime())) {
      Alert.alert('Error', 'Format tanggal tidak valid. Gunakan YYYY-MM-DD HH:MM, contoh 2026-08-15 10:00.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/booking', {
        pelanggan_id: user.id,
        layanan_id: layananId,
        tanggal_booking: match[1],
        jam_booking: `${match[2].padStart(2, '0')}:${match[3]}`,
        ...dataKendaraan,
        keluhan: keluhan.trim() || null,
      });

      const kode = res.data?.bookingId;
      Alert.alert('Booking berhasil', kode ? `Kode booking Anda: ${kode}` : 'Booking berhasil dibuat!', [
        { text: 'OK', onPress: () => navigation.navigate('Riwayat') },
      ]);
      setTanggal('');
      setKeluhan('');
      setPlat('');
      setMerk('');
      setTipe('');
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Gagal membuat booking.';
      Alert.alert('Booking gagal', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <AppHeader subtitle="Booking servis" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <SectionTitle title="Booking servis" subtitle="Pilih layanan, kendaraan, dan jadwal servis Anda." />

          {loadingData ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
          ) : (
            <>
              <Card style={{ padding: 20, marginBottom: 16 }}>
                <Text style={[type.label, styles.label]}>Layanan</Text>
                {layanan.length === 0 ? (
                  <Text style={[type.body, styles.empty]}>Belum ada layanan tersedia.</Text>
                ) : (
                  layanan.map((l) => (
                    <SelectChip
                      key={l.id}
                      label={l.nama_layanan}
                      sub={`${rupiah(l.harga)}${l.estimasi_waktu ? ` · ± ${l.estimasi_waktu} menit` : ''}`}
                      selected={l.id === layananId}
                      onPress={() => setLayananId(l.id)}
                    />
                  ))
                )}
              </Card>

              <Card style={{ padding: 20, marginBottom: 16 }}>
                <Text style={[type.label, styles.label]}>Kendaraan</Text>
                {vehicles.length > 0 ? (
                  vehicles.map((v) => (
                    <SelectChip
                      key={v.id}
                      label={v.plat_nomor}
                      sub={`${v.merk} ${v.tipe}${v.tahun ? ` (${v.tahun})` : ''}`}
                      selected={v.id === kendaraanId}
                      onPress={() => setKendaraanId(v.id)}
                    />
                  ))
                ) : (
                  <>
                    <View style={styles.info}>
                      <Info color={colors.info} size={18} />
                      <Text style={[type.body, { flex: 1, fontSize: 13.5, color: colors.foreground80, lineHeight: 19 }]}>
                        Belum ada kendaraan terdaftar. Isi data motor Anda, nanti otomatis tersimpan.
                      </Text>
                    </View>
                    <Field label="Plat nomor" placeholder="B 1234 ABC" value={plat} onChangeText={setPlat} autoCapitalize="characters" />
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Field label="Merk" placeholder="Honda" value={merk} onChangeText={setMerk} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Field label="Tipe" placeholder="Vario 160" value={tipe} onChangeText={setTipe} />
                      </View>
                    </View>
                  </>
                )}
              </Card>

              <Card style={{ padding: 20 }}>
                <Field
                  label="Tanggal & jam (YYYY-MM-DD HH:MM)"
                  placeholder="Contoh: 2026-08-15 10:00"
                  value={tanggal}
                  onChangeText={setTanggal}
                />
                <Field
                  label="Keluhan kendaraan (opsional)"
                  placeholder="Jelaskan masalah motor Anda..."
                  value={keluhan}
                  onChangeText={setKeluhan}
                  multiline
                  style={{ height: 110, textAlignVertical: 'top' }}
                />
                <Button title="Kirim booking" onPress={handleBooking} loading={loading} disabled={!layananId} style={{ marginTop: 4 }} />
              </Card>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 48 },
  info: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: colors.infoSoft, borderRadius: radius.md, padding: 14, marginBottom: 16 },
  label: { fontSize: 13, color: colors.foreground80, marginBottom: 10 },
  empty: { fontSize: 13.5, color: colors.mutedForeground },
});
