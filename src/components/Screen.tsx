import { PropsWithChildren } from 'react';
import { ScrollView, StyleProp, StyleSheet, ViewStyle, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

type Props = PropsWithChildren<{
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}>;

export function Screen({ children, scroll = true, contentStyle }: Props) {
  const { width } = useWindowDimensions();
  const containerStyle = [styles.content, width >= 720 && styles.wide, contentStyle];

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {scroll ? (
        <ScrollView contentContainerStyle={containerStyle} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={[containerStyle, styles.grow]}>{children}</ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  content: { flexGrow: 1, width: '100%', padding: 20, alignSelf: 'center' },
  wide: { maxWidth: 680, paddingHorizontal: 32 },
  grow: { flexGrow: 1 },
});
