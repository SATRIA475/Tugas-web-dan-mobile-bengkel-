import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Users, Wrench, CalendarClock, ChevronRight } from 'lucide-react-native';
import api from '../../utils/api';
import { Screen, Card, Button, IconTile } from '../../components/ui';
import { colors, type } from '../../theme';
import { AdminHeader, Loader } from './AdminShared';

export default function AdminDashboardScreen({ navigation }: any) {
  const [stats, setStats] = useState({ bookingMenunggu: 0, totalLayanan: 0, totalPelanggan: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminName, setAdminName] = useState('Admin');

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        const userDataStr = await AsyncStorage.getItem('userData');
        if (userDataStr) setAdminName(JSON.parse(userDataStr).nama || 'Admin');
      };
      loadUser();
      setLoading(true);
      fetchStats();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    navigation.replace('Login');
  };

  const small = [
    { label: 'Total pelanggan', value: stats?.totalPelanggan ?? 0, Icon: Users, tone: 'info' as const, fg: colors.info },
    { label: 'Total layanan', value: stats?.totalLayanan ?? 0, Icon: Wrench, tone: 'success' as const, fg: colors.success },
  ];

  return (
    <Screen>
      <AdminHeader onLogout={handleLogout} />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        <Text style={[type.body, { fontSize: 14, color: colors.mutedForeground }]}>Halo, {adminName}</Text>
        <Text style={[type.display, { fontSize: 26, lineHeight: 32, color: colors.foreground, marginTop: 4 }]}>Ringkasan hari ini</Text>
        <Text style={[type.body, { fontSize: 14, lineHeight: 20, color: colors.mutedForeground, marginTop: 6, marginBottom: 20 }]}>
          Pantau antrean dan data bengkel secara real-time.
        </Text>

        {loading ? (
          <Loader />
        ) : (
          <View style={{ gap: 12 }}>
            <Card highlight style={{ padding: 18 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <IconTile tone="primary">
                  <CalendarClock color={colors.primary} size={22} />
                </IconTile>
                <Text style={[type.label, { fontSize: 12.5, color: colors.primary }]}>Perlu ditangani</Text>
              </View>
              <Text style={[type.display, { fontSize: 40, lineHeight: 46, color: colors.foreground, marginTop: 14 }]}>
                {stats?.bookingMenunggu ?? 0}
              </Text>
              <Text style={[type.body, { fontSize: 14, color: colors.mutedForeground }]}>Booking menunggu</Text>
            </Card>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              {small.map(({ label, value, Icon, tone, fg }) => (
                <Card key={label} style={{ flex: 1, padding: 16 }}>
                  <IconTile tone={tone} size={40}>
                    <Icon color={fg} size={20} />
                  </IconTile>
                  <Text style={[type.display, { fontSize: 28, lineHeight: 34, color: colors.foreground, marginTop: 12 }]}>{value}</Text>
                  <Text style={[type.body, { fontSize: 13, color: colors.mutedForeground }]}>{label}</Text>
                </Card>
              ))}
            </View>
          </View>
        )}

        <Button
          title="Kelola semua booking"
          onPress={() => navigation.navigate('Transaksi')}
          icon={<ChevronRight color={colors.primaryForeground} size={18} />}
          style={{ marginTop: 20 }}
        />
      </ScrollView>
    </Screen>
  );
}
