import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { Assistant } from '../components/Assistant';
import { Screen } from '../components/Screen';
import { productEmoji } from '../data/products';
import { useApp } from '../contexts/AppContext';
import { colors, fonts, radius } from '../theme';
import { RootStackParamList } from '../types';
import { formatCurrency } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export function CartScreen({ navigation }: Props) {
  const { cart, removeFromCart, finishOrder } = useApp();
  const total = cart.reduce((sum, product) => sum + product.promotionalPrice, 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const finish = async () => {
    if (!cart.length || loading) return;
    setError('');
    setLoading(true);
    const result = await finishOrder();
    if (!result.ok) {
      setError(result.message);
      setLoading(false);
      return;
    }
    navigation.replace('OrderSuccess', { itemCount: result.itemCount, total: result.total });
  };

  return (
    <View style={styles.container}>
      <Screen contentStyle={styles.screen}>
        <Text style={styles.kicker}>RETIRADA NA LOJA</Text>
        <Text style={styles.title}>Seu carrinho</Text>
        <Text style={styles.subtitle}>{cart.length ? `${cart.length} ${cart.length === 1 ? 'item escolhido' : 'itens escolhidos'}` : 'Pronto para receber suas escolhas.'}</Text>

        <View style={styles.list}>
          {cart.map((product, index) => (
            <View key={`${product.name}-${index}`} style={styles.item}>
              <View style={styles.art}><Text style={styles.emoji}>{productEmoji[product.type]}</Text></View>
              <View style={styles.info}><Text numberOfLines={2} style={styles.name}>{product.name}</Text><Text style={styles.price}>{formatCurrency(product.promotionalPrice)}</Text></View>
              <Pressable accessibilityLabel={`Remover ${product.name}`} onPress={() => removeFromCart(index)} style={styles.remove}><Ionicons name="trash-outline" size={21} color={colors.coral} /></Pressable>
            </View>
          ))}
        </View>

        {!cart.length ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🦴</Text>
            <Text style={styles.emptyTitle}>O carrinho está esperando</Text>
            <Text style={styles.emptyText}>Adicione produtos do catálogo para montar seu pedido.</Text>
            <AppButton title="Explorar produtos" variant="secondary" onPress={() => navigation.navigate('Products')} style={styles.emptyButton} />
          </View>
        ) : (
          <View style={styles.summary}>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>{formatCurrency(total)}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Pagamento</Text><Text style={styles.pickup}>No caixa, na retirada</Text></View>
            <View style={styles.rule} />
            <View style={styles.summaryRow}><Text style={styles.totalLabel}>Total</Text><Text style={styles.total}>{formatCurrency(total)}</Text></View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <AppButton title="Finalizar pedido" onPress={finish} loading={loading} />
          </View>
        )}
      </Screen>
      <Assistant />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  screen: { paddingBottom: 105 },
  kicker: { color: colors.cobalt, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.5, marginTop: 8 },
  title: { color: colors.ink, fontFamily: fonts.display, fontSize: 32, marginTop: 4 },
  subtitle: { color: colors.muted, fontFamily: fonts.regular, fontSize: 15, marginBottom: 20 },
  list: { gap: 11 },
  item: { minHeight: 94, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 12 },
  art: { width: 62, height: 66, borderRadius: 16, backgroundColor: colors.sky, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 28 },
  info: { flex: 1, gap: 4 },
  name: { color: colors.ink, fontFamily: fonts.bold, fontSize: 15, lineHeight: 19 },
  price: { color: colors.mintDark, fontFamily: fonts.bold, fontSize: 15 },
  remove: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFF0EC', alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: 46, paddingHorizontal: 20 },
  emptyEmoji: { fontSize: 54 },
  emptyTitle: { color: colors.ink, fontFamily: fonts.display, fontSize: 23, marginTop: 13 },
  emptyText: { color: colors.muted, fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, textAlign: 'center', marginTop: 5 },
  emptyButton: { width: '100%', marginTop: 20 },
  summary: { gap: 13, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 20, marginTop: 18 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  summaryLabel: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14 },
  summaryValue: { color: colors.ink, fontFamily: fonts.semibold, fontSize: 15 },
  error: { color: colors.danger, fontFamily: fonts.regular, fontSize: 13 },
  pickup: { color: colors.cobalt, fontFamily: fonts.semibold, fontSize: 13 },
  rule: { height: 1, backgroundColor: colors.line, marginVertical: 2 },
  totalLabel: { color: colors.ink, fontFamily: fonts.display, fontSize: 20 },
  total: { color: colors.ink, fontFamily: fonts.display, fontSize: 24 },
});
