import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../utils/api';
import { requireUser } from '../utils/session';
import { ReceiptText, CalendarClock } from 'lucide-react-native';
import { Screen, AppHeader, Card, SectionTitle, Badge, EmptyState, statusTone } from '../components/ui';
import { colors, type, radius } from '../theme';

/** "MENUNGGU_KONFIRMASI" → "Menunggu konfirmasi" */
const formatStatus = (s?: string) => {
  const t = (s || '-').replace(/_/g, ' ').toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

const formatTanggal = (v?: string) => {
  if (!v) return '-';
  const d = new Date(String(v).replace(' ', 'T'));
  return isNaN(d.getTime())
    ? String(v)
    : d.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const rupiah = (n: number | string) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

export default function HistoryScreen({ navigation }: any) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const user = await requireUser(navigation);
      if (!user) return;
      const response = await api.get(`/customer/history/${user.id}`);
      setHistory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Memuat data setiap kali screen ini difokuskan
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchHistory();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  return (
    <Screen>
      <AppHeader subtitle="Riwayat servis" />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
        >
          <SectionTitle title="Riwayat servis" subtitle="Status dan catatan servis kendaraan Anda." />

          {history.length === 0 ? (
            <EmptyState title="Belum ada riwayat" desc="Riwayat servis Anda akan muncul di sini setelah booking pertama." />
          ) : (
            <View style={{ gap: 12 }}>
              {history.map((item) => {
                const lunas = item.status_pembayaran === 'Lunas';
                return (
                <Card key={item.id} highlight={lunas} style={{ padding: 18 }}>
                  <View style={styles.cardHead}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <CalendarClock color={colors.mutedForeground} size={15} />
                      <Text style={[type.label, { fontSize: 13, color: colors.mutedForeground }]}>
                        {formatTanggal(item.tanggal_booking)}
                      </Text>
                    </View>
                    <Badge text={lunas ? 'Lunas' : formatStatus(item.status)} tone={statusTone(lunas ? 'Lunas' : item.status)} />
                  </View>

                  <Text style={[type.display, { fontSize: 17, color: colors.foreground, marginTop: 10 }]}>{item.nama_layanan}</Text>
                  <Text style={[type.body, { fontSize: 13.5, color: colors.mutedForeground, marginTop: 2 }]}>
                    {item.merk} {item.tipe} · {item.plat_nomor}
                  </Text>

                  <Text style={[type.body, { fontSize: 12.5, color: colors.mutedForeground, marginTop: 6 }]}>Kode booking: {item.id}</Text>

                  <View style={styles.keluhan}>
                    <Text style={[type.label, { fontSize: 12.5, color: colors.mutedForeground, marginBottom: 4 }]}>Keluhan</Text>
                    <Text style={[type.body, { fontSize: 13.5, color: colors.foreground80, lineHeight: 19 }]}>{item.catatan || '-'}</Text>
                  </View>

                  {lunas && (
                    <View style={styles.paid}>
                      <ReceiptText color={colors.success} size={16} />
                      <Text style={[type.label, { flex: 1, fontSize: 13, color: colors.foreground80 }]}>
                        Dibayar {rupiah(item.total_bayar ?? item.harga)}
                        {item.metode_pembayaran ? ` · ${item.metode_pembayaran}` : ''}
                      </Text>
                    </View>
                  )}
                </Card>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paid: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, backgroundColor: colors.successSoft, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10 },
  keluhan: { marginTop: 14, backgroundColor: colors.secondary, borderRadius: radius.md, padding: 12 },
});
