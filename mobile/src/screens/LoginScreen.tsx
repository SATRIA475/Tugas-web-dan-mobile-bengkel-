import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft } from 'lucide-react-native';
import api from '../utils/api';
import { Screen, Card, Button, Field, Brand, Logo } from '../components/ui';
import { colors, type } from '../theme';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email dan Password tidak boleh kosong!');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));

        if (response.data.user.role === 'ADMIN' || response.data.user.role === 'SUPER_ADMIN') {
          navigation.replace('AdminApp');
        } else {
          navigation.replace('MainApp');
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Gagal login, periksa kembali koneksi atau kredensial Anda.';
      Alert.alert('Login Gagal', message);
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
            <Text style={[type.display, styles.title]}>Selamat datang kembali</Text>
            <Text style={[type.body, styles.subtitle]}>Masuk untuk booking servis dan melihat riwayat motor Anda.</Text>
          </View>

          <Card style={{ padding: 20 }}>
            <Field
              label="Email"
              placeholder="nama@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field label="Password" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />

            <Button title="Masuk" onPress={handleLogin} loading={loading} style={{ marginTop: 4 }} />
          </Card>

          <View style={styles.footRow}>
            <Text style={[type.body, { fontSize: 14, color: colors.mutedForeground }]}>Belum punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')} hitSlop={8}>
              <Text style={[type.label, { fontSize: 14, fontWeight: '700', color: colors.primary }]}>Daftar sekarang</Text>
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
