import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { User } from 'lucide-react-native';
import api from '../../utils/api';
import { Screen, Card, SectionTitle, EmptyState, IconTile } from '../../components/ui';
import { colors, type } from '../../theme';
import { AdminHeader, BackLink, Loader, InfoRow } from './AdminShared';

export default function AdminPelangganScreen({ navigation }: any) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/admin/customers');
      setCustomers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchCustomers();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomers();
  };

  return (
    <Screen>
      <AdminHeader />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        <BackLink onPress={() => navigation.goBack()} />
        <SectionTitle title="Data pelanggan" subtitle="Pengguna yang terdaftar sebagai member." />

        {loading ? (
          <Loader />
        ) : customers.length === 0 ? (
          <EmptyState title="Belum ada data" desc="Belum ada data pelanggan." />
        ) : (
          <View style={{ gap: 12 }}>
            {customers.map((item) => (
              <Card key={item.id} style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <IconTile tone="info" size={40}>
                    <User color={colors.info} size={20} />
                  </IconTile>
                  <Text style={[type.display, { fontSize: 17, color: colors.foreground, flex: 1 }]} numberOfLines={1}>
                    {item.nama}
                  </Text>
                </View>
                <InfoRow label="Email" value={item.email} />
                <InfoRow label="No. telepon" value={item.no_telepon} />
                <InfoRow label="Bergabung" value={item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID') : '-'} />
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
