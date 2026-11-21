import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, CalendarClock, Car, ReceiptText } from 'lucide-react-native';

import HomeScreen from '../screens/HomeScreen';
import BookingScreen from '../screens/BookingScreen';
import HistoryScreen from '../screens/HistoryScreen';
import VehicleScreen from '../screens/VehicleScreen';
import { colors } from '../theme';

export type TabParamList = {
  Home: undefined;
  Booking: undefined;
  Kendaraan: undefined;
  Riwayat: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
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
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Home color={color} size={22} />,
          tabBarLabel: 'Beranda',
        }}
      />
      <Tab.Screen
        name="Booking"
        component={BookingScreen}
        options={{
          tabBarIcon: ({ color }) => <CalendarClock color={color} size={22} />,
        }}
      />
      <Tab.Screen
        name="Kendaraan"
        component={VehicleScreen}
        options={{
          tabBarIcon: ({ color }) => <Car color={color} size={22} />,
        }}
      />
      <Tab.Screen
        name="Riwayat"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color }) => <ReceiptText color={color} size={22} />,
        }}
      />
    </Tab.Navigator>
  );
}
