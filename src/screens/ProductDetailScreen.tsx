import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { Assistant } from '../components/Assistant';
import { Screen } from '../components/Screen';
import { productEmoji } from '../data/products';
import { useApp } from '../contexts/AppContext';
import { colors, fonts, radius } from '../theme';
import { RootStackParamList } from '../types';
import { formatCurrency } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

export function ProductDetailScreen({ route, navigation }: Props) {
  const { product } = route.params;
  const { addToCart } = useApp();
  return (
    <View style={styles.container}>
      <Screen contentStyle={styles.screen}>
        <View style={styles.art}><Text style={styles.emoji}>{productEmoji[product.type]}</Text><View style={styles.promo}><Text style={styles.promoText}>OFERTA</Text></View></View>
        <Text style={styles.type}>{product.type.toUpperCase()}</Text>
        <Text style={styles.title}>{product.name}</Text>
        <View style={styles.priceRow}><Text style={styles.price}>{formatCurrency(product.promotionalPrice)}</Text><Text style={styles.oldPrice}>{formatCurrency(product.currentPrice)}</Text></View>
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Sobre este produto</Text>
        <Text style={styles.description}>{product.description}</Text>
        <View style={styles.infoCard}>
          <Ionicons name="calendar-clear-outline" size={21} color={colors.cobalt} />
          <View><Text style={styles.infoLabel}>VALIDADE</Text><Text style={styles.infoValue}>{product.expirationDate}</Text></View>
        </View>
        <AppButton title="Adicionar ao carrinho" onPress={() => { addToCart(product); navigation.navigate('Cart'); }} />
      </Screen>
      <Assistant />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  screen: { paddingBottom: 100 },
  art: { height: 260, borderRadius: radius.lg, backgroundColor: colors.sky, alignItems: 'center', justifyContent: 'center', marginBottom: 22, overflow: 'hidden' },
  emoji: { fontSize: 92 },
  promo: { position: 'absolute', top: 18, right: 18, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.mango },
  promoText: { color: colors.ink, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1 },
  type: { color: colors.cobalt, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.4 },
  title: { color: colors.ink, fontFamily: fonts.display, fontSize: 32, lineHeight: 37, marginTop: 5 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 10 },
  price: { color: colors.mintDark, fontFamily: fonts.bold, fontSize: 25 },
  oldPrice: { color: colors.muted, fontFamily: fonts.regular, fontSize: 15, textDecorationLine: 'line-through' },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 22 },
  sectionTitle: { color: colors.ink, fontFamily: fonts.display, fontSize: 20 },
  description: { color: colors.muted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, marginTop: 7, marginBottom: 18 },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 15, marginBottom: 20 },
  infoLabel: { color: colors.muted, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.1 },
  infoValue: { color: colors.ink, fontFamily: fonts.semibold, fontSize: 15 },
});
