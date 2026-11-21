import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../utils/api';
import { requireUser } from '../utils/session';
import { Motorbike, Plus, Trash2 } from 'lucide-react-native';
import { Screen, AppHeader, Card, SectionTitle, Button, Field, Badge, EmptyState, IconTile } from '../components/ui';
import { colors, type, radius } from '../theme';

export default function VehicleScreen({ navigation }: any) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State for new vehicle
  const [platNomor, setPlatNomor] = useState('');
  const [merek, setMerek] = useState('');
  const [model, setModel] = useState('');
  const [tahun, setTahun] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchVehicles = async () => {
    try {
      const user = await requireUser(navigation);
      if (!user) return;
      const response = await api.get(`/customer/vehicles/${user.id}`);
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

  const handleAddVehicle = async () => {
    if (!platNomor || !merek || !model) {
      Alert.alert('Error', 'Plat nomor, merek, dan tipe wajib diisi.');
      return;
    }
    const user = await requireUser(navigation);
    if (!user) return;

    setAdding(true);
    try {
      await api.post(`/customer/vehicles/${user.id}`, {
        plat_nomor: platNomor.trim().toUpperCase(),
        merk: merek.trim(),
        tipe: model.trim(),
        tahun: tahun ? parseInt(tahun, 10) : null,
      });
      Alert.alert('Sukses', 'Kendaraan berhasil ditambahkan.');
      setPlatNomor('');
      setMerek('');
      setModel('');
      setTahun('');
      fetchVehicles();
    } catch (error: any) {
      Alert.alert('Gagal', error.response?.data?.error || 'Gagal menambahkan kendaraan.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Konfirmasi', 'Hapus kendaraan ini dari garasi?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          const user = await requireUser(navigation);
          if (!user) return;
          try {
            await api.delete(`/customer/vehicles/${user.id}/${id}`);
            fetchVehicles();
          } catch (error) {
            Alert.alert('Gagal', 'Tidak dapat menghapus kendaraan.');
          }
        },
      },
    ]);
  };

  return (
    <Screen>
      <AppHeader subtitle="Garasi saya" />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
          >
            <SectionTitle title="Garasi saya" subtitle="Simpan data motor agar booking lebih cepat." />

            {/* Form tambah kendaraan */}
            <Card style={{ padding: 20 }}>
              <Text style={[type.display, styles.cardTitle]}>Tambah kendaraan</Text>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Field label="Plat nomor" placeholder="B 1234 XYZ" value={platNomor} onChangeText={setPlatNomor} autoCapitalize="characters" />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Tahun (opsional)" placeholder="2020" value={tahun} onChangeText={setTahun} keyboardType="number-pad" />
                </View>
              </View>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Field label="Merek" placeholder="Honda" value={merek} onChangeText={setMerek} />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Tipe" placeholder="Vario 160" value={model} onChangeText={setModel} />
                </View>
              </View>

              <Button
                title="Tambah ke garasi"
                onPress={handleAddVehicle}
                loading={adding}
                icon={<Plus color={colors.primaryForeground} size={18} />}
              />
            </Card>

            {/* Daftar kendaraan */}
            <View style={{ marginTop: 28 }}>
              <SectionTitle title="Kendaraan Anda" />
            </View>

            {vehicles.length === 0 ? (
              <EmptyState title="Garasi masih kosong" desc="Belum ada kendaraan di garasi. Tambahkan kendaraan pertama Anda di atas." />
            ) : (
              <Card>
                {vehicles.map((item, i) => (
                  <View key={item.id} style={[styles.vehicle, i > 0 && styles.divider]}>
                    <IconTile>
                      <Motorbike color={colors.primary} size={22} />
                    </IconTile>
                    <View style={{ flex: 1 }}>
                      <Text style={[type.label, { fontSize: 15, fontWeight: '700', color: colors.foreground }]}>
                        {item.merk} {item.tipe}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <Badge text={item.plat_nomor} tone="dark" />
                        {item.tahun ? <Text style={[type.body, { fontSize: 13, color: colors.mutedForeground }]}>Tahun {item.tahun}</Text> : null}
                      </View>
                    </View>
                    <TouchableOpacity style={styles.delete} onPress={() => handleDelete(item.id)} hitSlop={6}>
                      <Trash2 color={colors.primary} size={18} />
                    </TouchableOpacity>
                  </View>
                ))}
              </Card>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 18, color: colors.foreground, marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  vehicle: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  delete: { width: 38, height: 38, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
});
