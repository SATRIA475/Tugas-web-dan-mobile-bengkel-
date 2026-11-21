import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutDashboard, Wallet, ReceiptText, Database } from 'lucide-react-native';
import { colors } from '../theme';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminKasirScreen from '../screens/admin/AdminKasirScreen';
import AdminBookingScreen from '../screens/admin/AdminBookingScreen';
import AdminDataMenuScreen from '../screens/admin/AdminDataMenuScreen';
import AdminPelangganScreen from '../screens/admin/AdminPelangganScreen';
import AdminKendaraanScreen from '../screens/admin/AdminKendaraanScreen';
import AdminLayananScreen from '../screens/admin/AdminLayananScreen';

export type AdminTabParamList = {
  Dashboard: undefined;
  Kasir: undefined;
  Transaksi: undefined;
  DataStack: undefined;
};

export type AdminDataStackParamList = {
  MenuUtama: undefined;
  Pelanggan: undefined;
  Kendaraan: undefined;
  Layanan: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();
const Stack = createNativeStackNavigator<AdminDataStackParamList>();

function AdminDataStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="MenuUtama" component={AdminDataMenuScreen} />
      <Stack.Screen name="Pelanggan" component={AdminPelangganScreen} />
      <Stack.Screen name="Kendaraan" component={AdminKendaraanScreen} />
      <Stack.Screen name="Layanan" component={AdminLayananScreen} />
    </Stack.Navigator>
  );
}

export default function AdminTabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 6,
          paddingBottom: 6 + insets.bottom,
          height: 64 + insets.bottom,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 11,
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={AdminDashboardScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
          tabBarLabel: 'Dashboard'
        }}
      />
      <Tab.Screen 
        name="Kasir" 
        component={AdminKasirScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Wallet color={color} size={size} />,
          tabBarLabel: 'Kasir'
        }}
      />
      <Tab.Screen 
        name="Transaksi" 
        component={AdminBookingScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <ReceiptText color={color} size={size} />,
          tabBarLabel: 'Transaksi'
        }}
      />
      <Tab.Screen 
        name="DataStack" 
        component={AdminDataStack} 
        options={{
          tabBarIcon: ({ color, size }) => <Database color={color} size={size} />,
          tabBarLabel: 'Master data'
        }}
      />
    </Tab.Navigator>
  );
}
