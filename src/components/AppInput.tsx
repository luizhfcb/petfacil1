import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, fonts, radius } from '../theme';

type Props = TextInputProps & { label: string; error?: string };

export const AppInput = forwardRef<TextInput, Props>(({ label, error, style, ...props }, ref) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      ref={ref}
      placeholderTextColor={colors.muted}
      style={[styles.input, error && styles.inputError, style]}
      accessibilityLabel={label}
      {...props}
    />
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>
));

const styles = StyleSheet.create({
  wrapper: { gap: 7 },
  label: { color: colors.ink, fontFamily: fonts.semibold, fontSize: 14 },
  input: { minHeight: 52, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.sm, paddingHorizontal: 15, color: colors.ink, fontFamily: fonts.regular, fontSize: 16 },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontFamily: fonts.regular, fontSize: 13 },
});
