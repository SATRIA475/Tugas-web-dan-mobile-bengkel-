import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import api from '../utils/api';
import { Screen, Card, Button, Field, Brand, Logo } from '../components/ui';
import { colors, type } from '../theme';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !phone) {
      Alert.alert('Error', 'Semua kolom wajib diisi!');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', { nama: name.trim(), email: email.trim(), password, no_telepon: phone.trim() });
      Alert.alert('Sukses', 'Registrasi berhasil! Silakan login.', [
        { text: 'OK', onPress: () => navigation.replace('Login') },
      ]);
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Gagal registrasi.';
      Alert.alert('Registrasi Gagal', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {navigation.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back} hitSlop={8}>
              <ChevronLeft color={colors.mutedForeground} size={18} />
              <Text style={[type.label, { fontSize: 14, color: colors.mutedForeground }]}>Kembali</Text>
            </TouchableOpacity>
          )}

          <View style={styles.head}>
            <Logo size={64} />
            <View style={{ marginTop: 14 }}>
              <Brand size={22} />
            </View>
            <Text style={[type.display, styles.title]}>Buat akun member</Text>
            <Text style={[type.body, styles.subtitle]}>Daftar gratis untuk menyimpan data motor dan booking lebih cepat.</Text>
          </View>

          <Card style={{ padding: 20 }}>
            <Field label="Nama lengkap" placeholder="Nama lengkap" value={name} onChangeText={setName} />
            <Field
              label="Email"
              placeholder="nama@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field label="Nomor telepon / WA" placeholder="081234567890" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Field label="Password" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />

            <Button title="Daftar" onPress={handleRegister} loading={loading} style={{ marginTop: 4 }} />
          </Card>

          <View style={styles.footRow}>
            <Text style={[type.body, { fontSize: 14, color: colors.mutedForeground }]}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} hitSlop={8}>
              <Text style={[type.label, { fontSize: 14, fontWeight: '700', color: colors.primary }]}>Masuk di sini</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 24, justifyContent: 'center' },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start', marginBottom: 16, marginLeft: -4 },
  head: { alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 24, color: colors.foreground, marginTop: 20, textAlign: 'center' },
  subtitle: { fontSize: 14.5, lineHeight: 21, color: colors.mutedForeground, marginTop: 6, textAlign: 'center', maxWidth: 300 },
  footRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 },
});
