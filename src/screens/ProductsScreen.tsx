import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Assistant } from '../components/Assistant';
import { ProductCard } from '../components/ProductCard';
import { Screen } from '../components/Screen';
import { useApp } from '../contexts/AppContext';
import { api, ApiError } from '../services/api';
import { colors, fonts, radius } from '../theme';
import { Product, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Products'>;

export function ProductsScreen({ navigation }: Props) {
  const { currentUser, cart, addToCart } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Product['type'] | 'Todos'>('Todos');
  const categories: Array<Product['type'] | 'Todos'> = ['Todos', 'Ração', 'Brinquedo', 'Higiene', 'Acessório'];
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      setProducts(await api.products());
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : 'Não foi possível carregar os produtos.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void loadProducts(); }, [loadProducts]);
  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = category === 'Todos' || product.type === category;
    const query = search.trim().toLocaleLowerCase('pt-BR');
    return matchesCategory && (!query || `${product.name} ${product.type}`.toLocaleLowerCase('pt-BR').includes(query));
  }), [products, category, search]);

  return (
    <View style={styles.container}>
      <Screen contentStyle={styles.screen}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.hello}>OLÁ, {currentUser?.fullName.split(' ')[0]?.toLocaleUpperCase('pt-BR') ?? 'TUTOR'}</Text>
            <Text style={styles.title}>O que seu pet precisa?</Text>
          </View>
          <View style={styles.actions}>
            <Pressable accessibilityLabel="Ver histórico de pedidos" onPress={() => navigation.navigate('History')} style={styles.cartButton}>
              <Ionicons name="receipt-outline" size={24} color={colors.ink} />
            </Pressable>
            <Pressable accessibilityLabel={`Abrir carrinho com ${cart.length} itens`} onPress={() => navigation.navigate('Cart')} style={styles.cartButton}>
              <Ionicons name="bag-handle-outline" size={24} color={colors.ink} />
              {cart.length > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{cart.length}</Text></View> : null}
            </Pressable>
          </View>
        </View>

        <View style={styles.passport}>
          <View style={styles.passportStamp}><Text style={styles.passportEmoji}>🐶</Text></View>
          <View style={styles.passportCopy}>
            <Text style={styles.passportLabel}>PASSAPORTE PET</Text>
            <Text style={styles.passportTitle}>Preço de loja, carinho de casa.</Text>
            <Text style={styles.passportText}>Ofertas escolhidas para cuidar bem do seu pet sem pesar no bolso.</Text>
          </View>
          <View style={styles.notchTop} /><View style={styles.notchBottom} />
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={colors.muted} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Buscar ração, brinquedo..." placeholderTextColor={colors.muted} style={styles.searchInput} />
        </View>

        <View style={styles.categories}>
          {categories.map((item) => (
            <Pressable key={item} onPress={() => setCategory(item)} style={[styles.category, category === item && styles.categoryActive]}>
              <Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>{category === 'Todos' ? 'Achadinhos da semana' : category}</Text>
          <Text style={styles.count}>{filteredProducts.length} itens</Text>
        </View>
        <View style={styles.list}>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onOpen={() => navigation.navigate('ProductDetail', { product })} onAdd={() => addToCart(product)} />
          ))}
          {loading ? <ActivityIndicator size="large" color={colors.cobalt} style={styles.loader} /> : null}
          {loadError ? (
            <View style={styles.errorBox}>
              <Text style={styles.empty}>{loadError}</Text>
              <Pressable onPress={loadProducts} style={styles.retry}><Text style={styles.retryText}>Tentar de novo</Text></Pressable>
            </View>
          ) : null}
          {!loading && !loadError && filteredProducts.length === 0 ? <Text style={styles.empty}>Nenhum produto encontrado. Tente outra busca.</Text> : null}
        </View>
      </Screen>
      <Assistant />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  screen: { paddingBottom: 108 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  hello: { color: colors.cobalt, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.5 },
  title: { color: colors.ink, fontFamily: fonts.display, fontSize: 29, marginTop: 3 },
  actions: { flexDirection: 'row', gap: 10 },
  cartButton: { width: 50, height: 50, borderRadius: 17, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', right: -4, top: -5, minWidth: 21, height: 21, paddingHorizontal: 5, borderRadius: 11, backgroundColor: colors.coral, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: colors.white, fontFamily: fonts.bold, fontSize: 11 },
  passport: { minHeight: 150, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: colors.cobalt, borderRadius: radius.lg, padding: 20, marginBottom: 18 },
  passportStamp: { width: 74, height: 90, borderRadius: 37, backgroundColor: colors.mango, borderWidth: 3, borderColor: colors.white, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-7deg' }] },
  passportEmoji: { fontSize: 36 },
  passportCopy: { flex: 1, gap: 3 },
  passportLabel: { color: colors.mango, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.4 },
  passportTitle: { color: colors.white, fontFamily: fonts.display, fontSize: 22, lineHeight: 25 },
  passportText: { color: colors.sky, fontFamily: fonts.regular, fontSize: 12, lineHeight: 17 },
  notchTop: { position: 'absolute', width: 22, height: 22, borderRadius: 11, right: 44, top: -11, backgroundColor: colors.paper },
  notchBottom: { position: 'absolute', width: 22, height: 22, borderRadius: 11, right: 44, bottom: -11, backgroundColor: colors.paper },
  searchBox: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 15 },
  searchInput: { flex: 1, color: colors.ink, fontFamily: fonts.regular, fontSize: 15 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 16 },
  category: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  categoryActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  categoryText: { color: colors.ink, fontFamily: fonts.semibold, fontSize: 13 },
  categoryTextActive: { color: colors.white },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  sectionTitle: { color: colors.ink, fontFamily: fonts.display, fontSize: 22 },
  count: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13 },
  list: { gap: 13 },
  loader: { paddingVertical: 30 },
  errorBox: { alignItems: 'center', gap: 4 },
  retry: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 18, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.cobalt },
  retryText: { color: colors.cobalt, fontFamily: fonts.bold, fontSize: 14 },
  empty: { color: colors.muted, fontFamily: fonts.regular, fontSize: 15, textAlign: 'center', paddingVertical: 30 },
});
