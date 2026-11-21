import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, LayoutAnimation } from 'react-native';
import { Menu, X, ChevronRight, ChevronDown, Clock, ShieldCheck, CheckCircle2, Star, MapPin, Phone } from 'lucide-react-native';
import { Screen, AppHeader, Marquee, Card, SectionTitle, Button, IconButton, Brand, IconTile, Badge } from '../components/ui';
import { colors, type, radius } from '../theme';

const { width } = Dimensions.get('window');
const GUTTER = 20;

const layanan = [
  { id: '1', nama: 'Servis Rutin Ringan', desc: 'Ganti oli, cek kampas rem, busi, dan tegangan aki dengan presisi.', harga: 150000, menit: 60, popular: true },
  { id: '2', nama: 'Servis Besar / Berat', desc: 'Bongkar mesin (turun mesin), ganti piston, dan restorasi performa.', harga: 750000, menit: 360, popular: false },
  { id: '3', nama: 'Ganti Oli Mesin', desc: 'Ganti oli mesin standar pabrik dengan jaminan pelumas orisinil.', harga: 65000, menit: 30, popular: false },
];

const features = [
  { Icon: Clock, title: 'Tanpa antre', desc: 'Datang sesuai jadwal dan langsung ditangani di pit khusus.' },
  { Icon: ShieldCheck, title: 'Mekanik bersertifikat', desc: 'Ditangani teknisi berpengalaman dengan standar balap.' },
  { Icon: CheckCircle2, title: 'Biaya transparan', desc: 'Rincian biaya jelas di awal, tanpa biaya tersembunyi.' },
];

export const faqs = [
  { q: 'Bagaimana cara booking servis?', a: 'Buka menu Booking, pilih kendaraan, layanan, dan jadwal yang Anda inginkan. Anda perlu login atau daftar member terlebih dahulu.' },
  { q: 'Apakah harus daftar member untuk servis?', a: 'Untuk booking online, ya. Dengan akun member Anda bisa menyimpan data kendaraan dan melihat riwayat servis kapan saja.' },
  { q: 'Berapa lama waktu pengerjaan servis?', a: 'Tergantung layanan. Servis rutin sekitar 60 menit, ganti oli sekitar 30 menit, dan servis besar bisa sampai 6 jam.' },
  { q: 'Apakah suku cadangnya orisinil?', a: 'Ya. Kami hanya memakai suku cadang orisinil dan merek performa dari partner resmi seperti BRT, UMA Racing, TDR, KYB, dan lainnya.' },
  { q: 'Metode pembayaran apa saja yang diterima?', a: 'Pembayaran dilakukan di kasir bengkel setelah servis selesai. Rincian biaya selalu transparan sebelum pengerjaan.' },
  { q: 'Siapa yang mengembangkan aplikasi Satra Garage+?', a: 'Aplikasi ini dikembangkan oleh Riansa Putra (Backend dan SRS) dan Satria Arief Wibowo (Fullstack Developer).' },
];

const partners = [
  { name: 'BRT', img: require('../../assets/brands/brt1.png') },
  { name: 'UMA RACING', img: require('../../assets/brands/uma-racing.png') },
  { name: 'TDR', img: require('../../assets/brands/tdr.png') },
  { name: 'FIM PISTON', img: require('../../assets/brands/fim.png') },
  { name: 'KAWAHARA', img: require('../../assets/brands/kawahara.png') },
  { name: 'KYB', img: require('../../assets/brands/kyb.png') },
  { name: 'DAYTONA', img: require('../../assets/brands/daytona.png') },
  { name: 'YSS', img: require('../../assets/brands/yss.png') },
];

export function FaqList() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <Card style={{ paddingHorizontal: 4 }}>
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <View key={f.q} style={i > 0 && styles.faqDivider}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setOpen(isOpen ? null : i);
              }}
              style={styles.faqHead}
            >
              <Text style={[type.label, { flex: 1, fontSize: 15, fontWeight: '700', color: colors.foreground }]}>{f.q}</Text>
              <View style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}>
                <ChevronDown color={isOpen ? colors.primary : colors.mutedForeground} size={20} />
              </View>
            </TouchableOpacity>
            {isOpen && <Text style={[type.body, styles.faqBody]}>{f.a}</Text>}
          </View>
        );
      })}
    </Card>
  );
}

export default function LandingScreen({ navigation }: any) {
  const [menuOpen, setMenuOpen] = useState(false);
  const go = (r: string) => {
    setMenuOpen(false);
    navigation.navigate(r);
  };

  return (
    <Screen>
      <AppHeader
        right={
          <IconButton onPress={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X color={colors.foreground} size={20} /> : <Menu color={colors.foreground} size={20} />}
          </IconButton>
        }
      />

      {menuOpen && (
        <View style={styles.menu}>
          {[
            { label: 'Beranda', on: () => setMenuOpen(false) },
            { label: 'Layanan', on: () => go('Login') },
            { label: 'Daftar member', on: () => go('Register') },
          ].map((m) => (
            <TouchableOpacity key={m.label} style={styles.menuItem} onPress={m.on}>
              <Text style={[type.label, { fontSize: 15, color: colors.foreground }]}>{m.label}</Text>
              <ChevronRight color={colors.mutedForeground} size={18} />
            </TouchableOpacity>
          ))}
          <Button title="Masuk" onPress={() => go('Login')} style={{ margin: 16 }} />
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
        <Marquee />

        {/* HERO */}
        <View style={styles.block}>
          <Image source={require('../../assets/banner.png')} style={styles.hero} resizeMode="cover" />
          <Text style={[type.display, styles.heroTitle]}>
            Servis motor tanpa antre, <Text style={{ color: colors.primary }}>hasil maksimal.</Text>
          </Text>
          <Text style={[type.body, styles.heroDesc]}>Booking jadwal dari HP, datang tepat waktu, dan motor langsung ditangani mekanik berpengalaman.</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
            <Button title="Booking" onPress={() => navigation.navigate('Login')} icon={<ChevronRight color="#FFF" size={18} />} style={{ flex: 1 }} />
            <Button title="Daftar" variant="outline" onPress={() => navigation.navigate('Register')} style={{ flex: 1 }} />
          </View>
        </View>

        {/* STATS */}
        <View style={styles.block}>
          <Card style={styles.stats}>
            {[
              { n: '500+', l: 'Motor diservis' },
              { n: '99%', l: 'Pelanggan puas' },
              { n: '15+', l: 'Mekanik' },
            ].map((st, i) => (
              <View key={st.l} style={[styles.stat, i > 0 && { borderLeftWidth: 1, borderLeftColor: colors.border }]}>
                <Text style={[type.display, { fontSize: 22, color: colors.foreground }]}>{st.n}</Text>
                <Text style={[type.body, { fontSize: 12, color: colors.mutedForeground, marginTop: 2 }]}>{st.l}</Text>
              </View>
            ))}
          </Card>
        </View>

        {/* FEATURES */}
        <View style={styles.block}>
          <SectionTitle title="Kenapa" highlight="Satra Garage+" subtitle="Standar bengkel balap untuk motor harian Anda." />
          <Card>
            {features.map(({ Icon, title, desc }, i) => (
              <View key={title} style={[styles.featureRow, i > 0 && styles.faqDivider]}>
                <IconTile>
                  <Icon color={colors.primary} size={22} />
                </IconTile>
                <View style={{ flex: 1 }}>
                  <Text style={[type.label, { fontSize: 15, fontWeight: '700', color: colors.foreground }]}>{title}</Text>
                  <Text style={[type.body, { fontSize: 13.5, color: colors.mutedForeground, marginTop: 2, lineHeight: 19 }]}>{desc}</Text>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* LAYANAN */}
        <View style={styles.block}>
          <SectionTitle title="Layanan" highlight="populer" subtitle="Harga mulai dan estimasi waktu pengerjaan." />
          <View style={{ gap: 12 }}>
            {layanan.map((item) => (
              <Card key={item.id} highlight={item.popular} style={{ padding: 18 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <Text style={[type.display, { flex: 1, fontSize: 17, color: colors.foreground }]}>{item.nama}</Text>
                  {item.popular && (
                    <View style={styles.popular}>
                      <Star color={colors.primary} fill={colors.primary} size={11} />
                      <Text style={[type.label, { color: colors.primary, fontSize: 11.5 }]}>Rekomendasi</Text>
                    </View>
                  )}
                </View>
                <Text style={[type.body, { color: colors.foreground70, marginTop: 6, lineHeight: 20 }]}>{item.desc}</Text>
                <View style={styles.serviceFoot}>
                  <View>
                    <Text style={[type.display, { fontSize: 20, color: colors.foreground }]}>Rp {item.harga.toLocaleString('id-ID')}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Clock color={colors.mutedForeground} size={13} />
                      <Text style={[type.body, { fontSize: 12.5, color: colors.mutedForeground }]}>± {item.menit} menit</Text>
                    </View>
                  </View>
                  <Button title="Pilih" size="sm" variant={item.popular ? 'primary' : 'outline'} onPress={() => navigation.navigate('Login')} />
                </View>
              </Card>
            ))}
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.block}>
          <SectionTitle title="Pertanyaan" highlight="umum" subtitle="Yang sering ditanyakan tentang Satra Garage+." />
          <FaqList />
        </View>

        {/* PARTNERS */}
        <View style={styles.block}>
          <SectionTitle title="Partner" highlight="resmi" subtitle="Suku cadang performa tinggi berstandar kompetisi." />
          <View style={styles.partnersGrid}>
            {partners.map((p) => (
              <View key={p.name} style={styles.partnerBox}>
                <Image source={p.img} style={{ width: '78%', height: '62%' }} resizeMode="contain" />
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View style={styles.block}>
          <View style={styles.cta}>
            <Badge text="Member" tone="primary" style={{ backgroundColor: '#FFF' }} />
            <Text style={[type.display, { fontSize: 22, lineHeight: 28, color: '#FFF', marginTop: 10 }]}>Simpan data motor & riwayat servis Anda.</Text>
            <Text style={[type.body, { color: 'rgba(255,255,255,0.88)', marginTop: 6, lineHeight: 20 }]}>Daftar gratis, booking lebih cepat setiap kali datang.</Text>
            <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('Register')} style={styles.ctaBtn}>
              <Text style={[type.label, { color: colors.primary, fontSize: 15, fontWeight: '700' }]}>Daftar sekarang</Text>
              <ChevronRight color={colors.primary} size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Brand size={16} />
          <Text style={[type.body, styles.footerText]}>Pusat perawatan motor dengan standar balap.</Text>
          <View style={styles.contact}>
            <MapPin color={colors.mutedForeground} size={16} />
            <Text style={[type.body, styles.footerText, { flex: 1, marginTop: 0 }]}>Jl. Balap No. 99, Sirkuit Sentul, Bogor, Jawa Barat 16810</Text>
          </View>
          <View style={styles.contact}>
            <Phone color={colors.mutedForeground} size={16} />
            <Text style={[type.body, styles.footerText, { marginTop: 0 }]}>+62 812 3456 7890</Text>
          </View>
          <Text style={[type.body, { color: '#A1A1AA', fontSize: 12, marginTop: 20 }]}>© 2026 Satra Garage+</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    top: 65,
    left: 12,
    right: 12,
    zIndex: 20,
    elevation: 20,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: colors.border },

  block: { paddingHorizontal: GUTTER, paddingTop: 28 },
  hero: { width: width - GUTTER * 2, height: (width - GUTTER * 2) / 2, borderRadius: radius.xl },
  heroTitle: { fontSize: 28, lineHeight: 34, color: colors.foreground, marginTop: 22 },
  heroDesc: { fontSize: 15, lineHeight: 22, color: colors.mutedForeground, marginTop: 10 },

  stats: { flexDirection: 'row', paddingVertical: 16 },
  stat: { flex: 1, alignItems: 'center' },

  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },

  popular: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primarySoft, paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill },
  serviceFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border },

  faqDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  faqHead: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, paddingHorizontal: 14 },
  faqBody: { color: colors.foreground70, paddingHorizontal: 14, paddingBottom: 16, marginTop: -4, lineHeight: 21, fontSize: 14 },

  partnersGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  partnerBox: { width: (width - GUTTER * 2 - 10) / 2, height: 72, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },

  cta: { backgroundColor: colors.primary, borderRadius: radius.xl, padding: 22 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#FFF', borderRadius: radius.md, height: 48, marginTop: 18 },

  footer: { marginTop: 36, paddingHorizontal: GUTTER, paddingTop: 24, paddingBottom: 28, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card },
  footerText: { color: colors.mutedForeground, fontSize: 13, lineHeight: 19, marginTop: 6 },
  contact: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 12 },
});
