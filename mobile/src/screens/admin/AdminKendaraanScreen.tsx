import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Bike } from 'lucide-react-native';
import api from '../../utils/api';
import { Screen, Card, SectionTitle, Badge, EmptyState, IconTile } from '../../components/ui';
import { colors, type } from '../../theme';
import { AdminHeader, BackLink, Loader, InfoRow } from './AdminShared';

export default function AdminKendaraanScreen({ navigation }: any) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/admin/vehicles');
      setVehicles(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchVehicles();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchVehicles();
  };

  return (
    <Screen>
      <AdminHeader />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        <BackLink onPress={() => navigation.goBack()} />
        <SectionTitle title="Data kendaraan" subtitle="Kendaraan milik pelanggan yang terdaftar." />

        {loading ? (
          <Loader />
        ) : vehicles.length === 0 ? (
          <EmptyState title="Belum ada data" desc="Belum ada data kendaraan." />
        ) : (
          <View style={{ gap: 12 }}>
            {vehicles.map((item) => (
              <Card key={item.id} style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <IconTile tone="primary" size={40}>
                    <Bike color={colors.primary} size={20} />
                  </IconTile>
                  <Text style={[type.display, { fontSize: 18, color: colors.foreground, flex: 1 }]} numberOfLines={1}>
                    {item.plat_nomor}
                  </Text>
                  {item.tahun ? <Badge text={String(item.tahun)} tone="muted" /> : null}
                </View>
                <InfoRow label="Merk" value={item.merk} />
                <InfoRow label="Tipe" value={item.tipe} />
                <InfoRow label="Pemilik" value={item.pemilik} />
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
