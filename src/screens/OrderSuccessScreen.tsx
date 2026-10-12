import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { Screen } from '../components/Screen';
import { colors, fonts, radius } from '../theme';
import { RootStackParamList } from '../types';
import { formatCurrency } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderSuccess'>;

export function OrderSuccessScreen({ route, navigation }: Props) {
  const { itemCount, total } = route.params;
  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.ticket}>
        <View style={styles.icon}><Text style={styles.iconText}>✓</Text></View>
        <Text style={styles.kicker}>PEDIDO REGISTRADO</Text>
        <Text style={styles.title}>Tudo certo por aqui!</Text>
        <Text style={styles.description}>Seus {itemCount} {itemCount === 1 ? 'produto foi separado' : 'produtos foram separados'} para retirada. O pagamento acontece no caixa da loja.</Text>
        <View style={styles.rule} />
        <View style={styles.row}><Text style={styles.label}>Total do pedido</Text><Text style={styles.value}>{formatCurrency(total)}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Produtos reservados</Text><Text style={styles.value}>{itemCount}</Text></View>
        <Text style={styles.audit}>Seu pedido estará pronto para retirada em breve.</Text>
        <View style={styles.notchLeft} /><View style={styles.notchRight} />
      </View>
      <AppButton title="Voltar ao catálogo" onPress={() => navigation.popTo('Products')} style={styles.button} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'center', paddingVertical: 36 },
  ticket: { alignItems: 'center', overflow: 'hidden', backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 26 },
  icon: { width: 74, height: 74, borderRadius: 37, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  iconText: { color: colors.mintDark, fontFamily: fonts.display, fontSize: 36 },
  kicker: { color: colors.cobalt, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.5 },
  title: { color: colors.ink, fontFamily: fonts.display, fontSize: 31, marginTop: 5 },
  description: { color: colors.muted, fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 9 },
  rule: { width: '100%', borderTopWidth: 1, borderStyle: 'dashed', borderColor: colors.line, marginVertical: 24 },
  row: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', gap: 14, marginBottom: 10 },
  label: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14 },
  value: { color: colors.ink, fontFamily: fonts.bold, fontSize: 15 },
  audit: { color: colors.mintDark, fontFamily: fonts.semibold, fontSize: 12, marginTop: 12 },
  notchLeft: { position: 'absolute', left: -14, top: '59%', width: 28, height: 28, borderRadius: 14, backgroundColor: colors.paper },
  notchRight: { position: 'absolute', right: -14, top: '59%', width: 28, height: 28, borderRadius: 14, backgroundColor: colors.paper },
  button: { marginTop: 18 },
});
