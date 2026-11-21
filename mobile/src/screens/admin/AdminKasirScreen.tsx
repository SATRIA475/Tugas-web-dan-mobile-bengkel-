import React, { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Search, CheckCircle2, Printer } from 'lucide-react-native';
import api from '../../utils/api';
import { requireUser } from '../../utils/session';
import { Screen, Card, SectionTitle, Button, Field, Badge, statusTone, Brand, IconTile } from '../../components/ui';
import { colors, radius, type } from '../../theme';
import { AdminHeader, InfoRow, DashedDivider, formatRupiah } from './AdminShared';

export default function AdminKasirScreen({ navigation }: any) {
  const [bookingCode, setBookingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [paying, setPaying] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    navigation.replace('Login');
  };

  const handleSearch = async () => {
    if (!bookingCode) {
      Alert.alert('Error', 'Masukkan kode booking terlebih dahulu!');
      return;
    }

    setLoading(true);
    setBookingData(null);
    setReceipt(null);
    try {
      const response = await api.get(`/booking/${bookingCode}`);
      setBookingData(response.data);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Booking tidak ditemukan.';
      Alert.alert('Gagal', message);
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    // Pembayaran harus tercatat atas nama admin yang login, tanpa ID cadangan
    const admin = await requireUser(navigation);
    if (!admin) return;

    setPaying(true);
    try {
      const adminId = admin.id;

      const response = await api.post(`/booking/${bookingCode}/pay`, {
        admin_id: adminId,
        total_bayar: bookingData.harga,
        metode_pembayaran: 'Tunai',
      });

      setReceipt({
        ...bookingData,
        transaksiId: response.data.transaksiId,
        tanggalBayar: new Date().toISOString(),
      });
      setBookingData(null);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Gagal memproses pembayaran.';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setPaying(false);
    }
  };

  const handlePay = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Selesaikan dan proses pembayaran untuk booking ini?');
      if (confirmed) {
        processPayment();
      }
    } else {
      Alert.alert('Konfirmasi', 'Selesaikan dan proses pembayaran untuk booking ini?', [
        { text: 'Batal', style: 'cancel' },
        { text: 'Proses Pembayaran', onPress: processPayment },
      ]);
    }
  };

  const printReceipt = () => {
    if (Platform.OS === 'web') {
      window.print();
    } else {
      Alert.alert('Info', 'Fitur cetak fisik (Bluetooth Printer) akan segera hadir untuk aplikasi mobile!');
    }
  };

  const status = String(bookingData?.status || '-');

  return (
    <Screen>
      <AdminHeader onLogout={handleLogout} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }} keyboardShouldPersistTaps="handled">
          <SectionTitle title="Kasir" subtitle="Selesaikan transaksi dan cetak struk pembayaran." />

          <Card style={{ padding: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <IconTile tone="primary" size={40}>
                <Search color={colors.primary} size={20} />
              </IconTile>
              <View style={{ flex: 1 }}>
                <Text style={[type.label, { fontSize: 15, fontWeight: '700', color: colors.foreground }]}>Cari booking</Text>
                <Text style={[type.body, { fontSize: 13, color: colors.mutedForeground, marginTop: 2, lineHeight: 18 }]}>
                  Masukkan kode unik booking, contoh BKG-A1B2C3.
                </Text>
              </View>
            </View>
            <Field
              label="Kode booking"
              placeholder="BKG-XXXXXX"
              value={bookingCode}
              onChangeText={setBookingCode}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            <Button title="Cari booking" onPress={handleSearch} loading={loading} icon={<Search color={colors.primaryForeground} size={18} />} />
          </Card>

          {bookingData && (
            <Card style={{ padding: 18 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Text style={[type.display, { fontSize: 17, color: colors.foreground, flexShrink: 1 }]}>Detail booking</Text>
                <Badge text={status} tone={statusTone(status)} />
              </View>

              <InfoRow label="Kode booking" value={bookingData.id} />
              <InfoRow label="Pelanggan" value={bookingData.pelanggan_nama} />
              <InfoRow label="Kendaraan" value={`${bookingData.merk ?? ''} ${bookingData.tipe ?? ''} (${bookingData.plat_nomor ?? '-'})`} />
              <InfoRow label="Layanan" value={bookingData.nama_layanan} />
              <InfoRow
                label="Jadwal"
                value={bookingData.tanggal_booking ? new Date(bookingData.tanggal_booking).toLocaleString('id-ID') : '-'}
              />

              <View style={{ marginTop: 14, padding: 16, backgroundColor: colors.primarySoft, borderRadius: radius.md }}>
                <Text style={[type.label, { fontSize: 13, color: colors.primary }]}>Total biaya</Text>
                <Text style={[type.display, { fontSize: 28, lineHeight: 34, color: colors.foreground, marginTop: 2 }]}>{formatRupiah(bookingData.harga)}</Text>
              </View>

              {bookingData.status !== 'Selesai' && (
                <Button
                  title="Proses & lunaskan"
                  onPress={handlePay}
                  loading={paying}
                  icon={<CheckCircle2 color={colors.primaryForeground} size={18} />}
                  style={{ marginTop: 14 }}
                />
              )}
            </Card>
          )}

          {receipt && (
            <Card style={{ padding: 22 }}>
              <View style={{ alignItems: 'center', gap: 2 }}>
                <IconTile tone="success" size={44}>
                  <CheckCircle2 color={colors.success} size={22} />
                </IconTile>
                <Text style={[type.label, { fontSize: 13, color: colors.success, marginTop: 8 }]}>Pembayaran berhasil</Text>
                <View style={{ marginTop: 10 }}>
                  <Brand size={20} />
                </View>
                <Text style={[type.body, { fontSize: 12, color: colors.mutedForeground }]}>Jl. Balap No. 99, Jakarta</Text>
                <Text style={[type.body, { fontSize: 12, color: colors.mutedForeground }]}>Telp 0812-3456-7890</Text>
              </View>

              <DashedDivider />

              <ReceiptRow label="Tanggal" value={new Date(receipt.tanggalBayar).toLocaleDateString('id-ID')} />
              <ReceiptRow label="Waktu" value={new Date(receipt.tanggalBayar).toLocaleTimeString('id-ID')} />
              <ReceiptRow label="Kasir" value="Admin" />
              <ReceiptRow label="Kode booking" value={String(receipt.id ?? '-')} />
              <ReceiptRow label="No. transaksi" value={String(receipt.transaksiId ?? '-').substring(0, 8).toUpperCase()} />

              <DashedDivider />

              <Text style={[type.label, { fontSize: 15, fontWeight: '700', color: colors.foreground }]}>{receipt.nama_layanan}</Text>
              <Text style={[type.body, { fontSize: 12.5, color: colors.mutedForeground, marginTop: 2 }]}>
                {receipt.merk} {receipt.tipe} ({receipt.plat_nomor})
              </Text>

              <DashedDivider />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[type.label, { fontSize: 15, color: colors.foreground }]}>Total</Text>
                <Text style={[type.display, { fontSize: 22, color: colors.primary }]}>{formatRupiah(receipt.harga)}</Text>
              </View>

              <DashedDivider />

              <View style={{ alignItems: 'center', marginBottom: 18 }}>
                <Text style={[type.label, { fontSize: 13, color: colors.foreground }]}>Terima kasih</Text>
                <Text style={[type.body, { fontSize: 12, color: colors.mutedForeground, marginTop: 2, textAlign: 'center' }]}>
                  Pilihan tepat kaum elite pecinta kecepatan.
                </Text>
              </View>

              <Button title="Cetak struk" variant="outline" onPress={printReceipt} icon={<Printer color={colors.foreground} size={18} />} />
            </Card>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, gap: 12 }}>
      <Text style={[type.body, { fontSize: 13, color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[type.label, { fontSize: 13, color: colors.foreground }]}>{value}</Text>
    </View>
  );
}
