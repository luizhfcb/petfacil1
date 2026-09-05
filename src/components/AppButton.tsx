import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, fonts, radius } from '../theme';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
};

export function AppButton({ title, onPress, disabled, loading, variant = 'primary', style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled || loading) }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed, disabled && styles.disabled, style]}
    >
      {loading ? <ActivityIndicator color={colors.white} /> : <Text style={[styles.label, variant !== 'primary' && styles.secondaryLabel]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  primary: { backgroundColor: colors.cobalt },
  secondary: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.cobalt },
  danger: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.coral },
  label: { color: colors.white, fontFamily: fonts.bold, fontSize: 16 },
  secondaryLabel: { color: colors.ink },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.45 },
});
