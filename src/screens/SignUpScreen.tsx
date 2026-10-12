import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { Screen } from '../components/Screen';
import { useApp } from '../contexts/AppContext';
import { colors, fonts, radius } from '../theme';
import { RootStackParamList } from '../types';
import { formatCpf, onlyDigits, SignUpFields, validateSignUp } from '../utils/validators';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

const initialFields: SignUpFields = { fullName: '', email: '', cpf: '', password: '', passwordConfirmation: '' };

export function SignUpScreen({ navigation }: Props) {
  const { signUp } = useApp();
  const [fields, setFields] = useState(initialFields);
  const [touched, setTouched] = useState<Partial<Record<keyof SignUpFields, boolean>>>({});
  const [submitError, setSubmitError] = useState('');
  const errors = useMemo(() => validateSignUp(fields), [fields]);
  const isValid = Object.keys(errors).length === 0;
  const update = (field: keyof SignUpFields, value: string) => setFields((current) => ({ ...current, [field]: value }));
  const errorFor = (field: keyof SignUpFields) => touched[field] ? errors[field] : undefined;

  const submit = () => {
    setTouched({ fullName: true, email: true, cpf: true, password: true, passwordConfirmation: true });
    if (!isValid) return;
    const result = signUp({ fullName: fields.fullName.trim(), cpf: onlyDigits(fields.cpf), login: fields.email.trim(), password: fields.password });
    if (!result.ok) {
      setSubmitError(result.message ?? 'Não foi possível criar a conta.');
      return;
    }
    navigation.goBack();
  };

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.heading}>
        <Text style={styles.kicker}>SEU PASSAPORTE PET</Text>
        <Text style={styles.title}>Vamos criar sua conta.</Text>
        <Text style={styles.description}>Preencha todos os campos para criar sua conta e começar a escolher os produtos.</Text>
      </View>
      <View style={styles.form}>
        <AppInput label="Nome completo" value={fields.fullName} onChangeText={(value) => update('fullName', value)} onBlur={() => setTouched((current) => ({ ...current, fullName: true }))} error={errorFor('fullName')} placeholder="Como você quer ser chamado" />
        <AppInput label="E-mail" value={fields.email} onChangeText={(value) => update('email', value)} onBlur={() => setTouched((current) => ({ ...current, email: true }))} error={errorFor('email')} keyboardType="email-address" autoCapitalize="none" placeholder="voce@email.com" />
        <AppInput label="CPF" value={fields.cpf} onChangeText={(value) => update('cpf', formatCpf(value))} onBlur={() => setTouched((current) => ({ ...current, cpf: true }))} error={errorFor('cpf')} keyboardType="numeric" placeholder="000.000.000-00" maxLength={14} />
        <AppInput label="Senha" value={fields.password} onChangeText={(value) => update('password', value)} onBlur={() => setTouched((current) => ({ ...current, password: true }))} error={errorFor('password')} secureTextEntry placeholder="Crie uma senha" />
        <AppInput label="Repetir senha" value={fields.passwordConfirmation} onChangeText={(value) => update('passwordConfirmation', value)} onBlur={() => setTouched((current) => ({ ...current, passwordConfirmation: true }))} error={errorFor('passwordConfirmation')} secureTextEntry placeholder="Digite a mesma senha" />
        {submitError ? <Text style={styles.error}>{submitError}</Text> : null}
        <AppButton title="Criar conta" onPress={submit} disabled={!isValid} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: 36 },
  heading: { gap: 7, paddingVertical: 18 },
  kicker: { color: colors.cobalt, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.7 },
  title: { color: colors.ink, fontFamily: fonts.display, fontSize: 32 },
  description: { color: colors.muted, fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  form: { gap: 16, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 20 },
  error: { color: colors.danger, fontFamily: fonts.regular, fontSize: 13 },
});
