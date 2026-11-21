import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ReceiptText } from 'lucide-react-native';
import api from '../../utils/api';
import { Screen, Card, SectionTitle, Button, Badge, statusTone, EmptyState } from '../../components/ui';
import { colors, type } from '../../theme';
import { AdminHeader, Loader, InfoRow } from './AdminShared';

export default function AdminBookingScreen({ navigation }: any) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/admin/bookings');
      setBookings(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchBookings();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  return (
    <Screen>
      <AdminHeader />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        <SectionTitle title="Daftar booking" subtitle="Antrean servis kendaraan pelanggan." />

        {loading ? (
          <Loader />
        ) : bookings.length === 0 ? (
          <EmptyState title="Belum ada booking" desc="Belum ada riwayat transaksi." />
        ) : (
          <View style={{ gap: 12 }}>
            {bookings.map((item) => {
              const status = String(item.status || '-');
              return (
                <Card key={item.id} style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <View style={{ flexShrink: 1 }}>
                      <Text style={[type.body, { fontSize: 12, color: colors.mutedForeground }]}>Kode booking</Text>
                      <Text style={[type.display, { fontSize: 17, color: colors.foreground }]} numberOfLines={1}>
                        {item.id}
                      </Text>
                    </View>
                    <Badge text={status} tone={statusTone(status)} />
                  </View>

                  <InfoRow label="Pelanggan" value={item.pelanggan_nama} />
                  <InfoRow label="Plat nomor" value={item.plat_nomor} />
                  <InfoRow label="Layanan" value={item.nama_layanan} />
                  <InfoRow
                    label="Jadwal"
                    value={item.tanggal_booking ? new Date(item.tanggal_booking).toLocaleString('id-ID') : '-'}
                  />

                  {item.status !== 'Selesai' && (
                    <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, alignItems: 'flex-end' }}>
                      <Button
                        title="Proses di kasir"
                        size="sm"
                        // Belum ada prefill kode booking; cukup pindah ke tab Kasir.
                        onPress={() => navigation.navigate('Kasir')}
                        icon={<ReceiptText color={colors.primaryForeground} size={16} />}
                      />
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
