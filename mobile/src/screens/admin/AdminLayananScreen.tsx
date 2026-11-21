import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Clock } from 'lucide-react-native';
import api from '../../utils/api';
import { Screen, Card, SectionTitle, EmptyState } from '../../components/ui';
import { colors, type } from '../../theme';
import { AdminHeader, BackLink, Loader, formatRupiah } from './AdminShared';

export default function AdminLayananScreen({ navigation }: any) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchServices = async () => {
    try {
      const response = await api.get('/admin/services');
      setServices(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchServices();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

  return (
    <Screen>
      <AdminHeader />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        <BackLink onPress={() => navigation.goBack()} />
        <SectionTitle title="Data layanan" subtitle="Paket servis, harga, dan estimasi waktu." />

        {loading ? (
          <Loader />
        ) : services.length === 0 ? (
          <EmptyState title="Belum ada data" desc="Belum ada data layanan." />
        ) : (
          <View style={{ gap: 12 }}>
            {services.map((item) => (
              <Card key={item.id} style={{ padding: 16 }}>
                <Text style={[type.display, { fontSize: 17, color: colors.foreground }]}>{item.nama_layanan}</Text>
                {item.deskripsi ? (
                  <Text style={[type.body, { fontSize: 13, color: colors.mutedForeground, marginTop: 4, lineHeight: 19 }]}>{item.deskripsi}</Text>
                ) : null}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 14,
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}
                >
                  <Text style={[type.display, { fontSize: 19, color: colors.foreground }]}>{formatRupiah(item.harga)}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Clock color={colors.mutedForeground} size={14} />
                    <Text style={[type.body, { fontSize: 13, color: colors.mutedForeground }]}>± {item.estimasi_waktu ?? '-'} menit</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
