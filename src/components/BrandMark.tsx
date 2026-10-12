import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../theme';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.row}>
      <View style={[styles.mark, compact && styles.compactMark]}><Text style={styles.paw}>🐾</Text></View>
      <Text style={[styles.name, compact && styles.compactName]}>PetFacil</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 54, height: 54, borderRadius: radius.md, backgroundColor: colors.mango, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-5deg' }] },
  compactMark: { width: 42, height: 42, borderRadius: 14 },
  paw: { fontSize: 24 },
  name: { color: colors.ink, fontFamily: fonts.display, fontSize: 32 },
  compactName: { fontSize: 25 },
});
