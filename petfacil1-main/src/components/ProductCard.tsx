import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { productEmoji } from '../data/products';
import { colors, fonts, radius, shadow } from '../theme';
import { formatCurrency } from '../utils/format';

type Props = { product: Product; onOpen: () => void; onAdd: () => void };

export function ProductCard({ product, onOpen, onAdd }: Props) {
  return (
    <Pressable onPress={onOpen} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.art}><Text style={styles.emoji}>{productEmoji[product.type]}</Text></View>
      <View style={styles.info}>
        <Text style={styles.type}>{product.type.toUpperCase()}</Text>
        <Text numberOfLines={2} style={styles.name}>{product.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatCurrency(product.promotionalPrice)}</Text>
          <Text style={styles.oldPrice}>{formatCurrency(product.currentPrice)}</Text>
        </View>
      </View>
      <Pressable accessibilityLabel={`Adicionar ${product.name} ao carrinho`} hitSlop={8} onPress={(event) => { event.stopPropagation(); onAdd(); }} style={styles.addButton}>
        <Ionicons name="add" size={24} color={colors.white} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 132, flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.white, borderRadius: radius.lg, padding: 14, ...shadow },
  pressed: { opacity: 0.88 },
  art: { width: 86, height: 100, borderRadius: radius.md, backgroundColor: colors.sky, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 40 },
  info: { flex: 1, gap: 4 },
  type: { color: colors.cobalt, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.2 },
  name: { color: colors.ink, fontFamily: fonts.bold, fontSize: 17, lineHeight: 21 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginTop: 3 },
  price: { color: colors.mintDark, fontFamily: fonts.bold, fontSize: 17 },
  oldPrice: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12, textDecorationLine: 'line-through' },
  addButton: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.cobalt, alignItems: 'center', justifyContent: 'center' },
});
