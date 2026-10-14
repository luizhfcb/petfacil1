import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { Screen } from '../components/Screen';
import { useApp } from '../contexts/AppContext';
import { api, ApiError } from '../services/api';
import { colors, fonts, radius } from '../theme';
import { Order, RootStackParamList } from '../types';
import { formatCurrency, formatDateTime } from '../utils/format';
import { groupOrderItems } from '../utils/orders';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

export function HistoryScreen({ navigation }: Props) {
  const { signOut } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setOrders(await api.orders());
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        signOut();
        return;
      }
      setError(e instanceof ApiError ? e.message : 'Não foi possível carregar seus pedidos.');
    } finally {
      setLoading(false);
    }
  }, [signOut]);

  useEffect(() => { void load(); }, [load]);

  return (
    <Screen contentStyle={styles.screen}>
      <Text style={styles.kicker}>SUAS COMPRAS</Text>
      <Text style={styles.title}>Histórico de pedidos</Text>
      <Text style={styles.subtitle}>{loading ? 'Buscando seus pedidos...' : orders.length ? `${orders.length} ${orders.length === 1 ? 'pedido realizado' : 'pedidos realizados'}` : ' '}</Text>

      {loading ? <ActivityIndicator size="large" color={colors.cobalt} style={styles.loader} /> : null}

      {error ? (
        <View style={styles.center}>
          <Text style={styles.message}>{error}</Text>
          <AppButton title="Tentar de novo" variant="secondary" onPress={load} style={styles.fullButton} />
        </View>
      ) : null}

      {!loading && !error && orders.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🧾</Text>
          <Text style={styles.emptyTitle}>Nenhum pedido ainda</Text>
          <Text style={styles.message}>Quando você finalizar uma compra, ela aparece aqui.</Text>
          <AppButton title="Explorar produtos" variant="secondary" onPress={() => navigation.navigate('Products')} style={styles.fullButton} />
        </View>
      ) : null}

      <View style={styles.list}>
        {orders.map((order) => (
          <View key={order.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.date}>{formatDateTime(order.purchaseDate)}</Text>
              <View style={styles.status}><Text style={styles.statusText}>{order.status}</Text></View>
            </View>
            {groupOrderItems(order.items).map((item) => (
              <View key={item.name} style={styles.itemRow}>
                <Text numberOfLines={2} style={styles.itemName}>{item.quantity}x {item.name}</Text>
                <Text style={styles.itemPrice}>{formatCurrency(item.subtotal)}</Text>
              </View>
            ))}
            <View style={styles.rule} />
            <View style={styles.itemRow}>
              <Text style={styles.totalLabel}>Total ({order.itemCount} {order.itemCount === 1 ? 'item' : 'itens'})</Text>
              <Text style={styles.total}>{formatCurrency(order.total)}</Text>
            </View>
            <Text style={styles.payment}>{order.paymentMethod}. Pagamento no caixa.</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: 36 },
  kicker: { color: colors.cobalt, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.5, marginTop: 8 },
  title: { color: colors.ink, fontFamily: fonts.display, fontSize: 32, marginTop: 4 },
  subtitle: { color: colors.muted, fontFamily: fonts.regular, fontSize: 15, marginBottom: 20 },
  loader: { paddingVertical: 30 },
  center: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 12, gap: 6 },
  emptyEmoji: { fontSize: 50 },
  emptyTitle: { color: colors.ink, fontFamily: fonts.display, fontSize: 22 },
  message: { color: colors.muted, fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, textAlign: 'center' },
  fullButton: { width: '100%', marginTop: 14 },
  list: { gap: 13 },
  card: { gap: 10, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 18 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  date: { color: colors.ink, fontFamily: fonts.bold, fontSize: 15 },
  status: { paddingHorizontal: 11, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: colors.mint },
  statusText: { color: colors.mintDark, fontFamily: fonts.bold, fontSize: 11 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  itemName: { flex: 1, color: colors.ink, fontFamily: fonts.regular, fontSize: 14 },
  itemPrice: { color: colors.ink, fontFamily: fonts.semibold, fontSize: 14 },
  rule: { height: 1, backgroundColor: colors.line },
  totalLabel: { color: colors.ink, fontFamily: fonts.display, fontSize: 16 },
  total: { color: colors.mintDark, fontFamily: fonts.display, fontSize: 19 },
  payment: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12 },
});
