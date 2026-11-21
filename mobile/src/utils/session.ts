import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export type SessionUser = { id: string; nama?: string; email?: string; role?: string };

/** Ambil user yang sedang login dari AsyncStorage. Null jika belum login / data rusak. */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const raw = await AsyncStorage.getItem('userData');
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user && user.id ? user : null;
  } catch {
    return null;
  }
}

/** Arahkan ke halaman Login (dari dalam tab navigator maupun stack). */
export function goToLogin(navigation: any) {
  const stack = navigation?.getParent?.() ?? navigation;
  stack?.reset?.({ index: 1, routes: [{ name: 'Landing' }, { name: 'Login' }] });
}

/**
 * Ambil user login; jika tidak ada, beri tahu pengguna dan arahkan ke Login.
 * Tidak pernah memakai ID cadangan, supaya data pengguna lain tidak ikut tampil.
 */
export async function requireUser(navigation: any): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user) {
    Alert.alert('Sesi berakhir', 'Silakan masuk kembali untuk melanjutkan.');
    goToLogin(navigation);
  }
  return user;
}
