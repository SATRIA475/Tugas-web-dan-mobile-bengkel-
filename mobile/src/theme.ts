import { Platform, ViewStyle } from 'react-native';

// Desain "modern bersih" khusus mobile: sudut membulat, bayangan halus, banyak ruang.
export const colors = {
  background: '#F6F6F7', // latar aplikasi (abu sangat muda)
  card: '#FFFFFF',
  foreground: '#18181B',
  primary: '#DC2626',
  primaryForeground: '#FFFFFF',
  primarySoft: '#FEF2F2',
  primaryBorder: '#FECACA',
  secondary: '#F4F4F5',
  muted: '#E4E4E7',
  mutedForeground: '#71717A',
  border: '#E8E8EB',
  foreground70: '#52525B',
  foreground80: '#3F3F46',
  shadowSoft: 'rgba(24,24,27,0.08)',
  success: '#16A34A',
  successSoft: '#ECFDF3',
  warning: '#D97706',
  warningSoft: '#FFFBEB',
  info: '#2563EB',
  infoSoft: '#EFF6FF',
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const borders = { thick: 1, medium: 1 };

export const type = {
  display: { fontWeight: '800' as const, letterSpacing: -0.4 },
  label: { fontWeight: '600' as const, letterSpacing: 0.1 },
  body: { fontWeight: '400' as const },
};

export const shadow = (level: 1 | 2 = 1): ViewStyle =>
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#18181B',
      shadowOpacity: level === 1 ? 0.06 : 0.1,
      shadowRadius: level === 1 ? 10 : 18,
      shadowOffset: { width: 0, height: level === 1 ? 4 : 8 },
    },
    android: { elevation: level === 1 ? 2 : 5 },
    default: { boxShadow: level === 1 ? '0 4px 14px rgba(24,24,27,0.06)' : '0 10px 28px rgba(24,24,27,0.10)' } as ViewStyle,
  })!;
