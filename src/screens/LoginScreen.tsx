import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { BrandMark } from '../components/BrandMark';
import { Screen } from '../components/Screen';
import { useApp } from '../contexts/AppContext';
import { colors, fonts, radius } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useApp();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!login.trim() || !password) {
      setError('Preencha e-mail e senha para continuar.');
      return;
    }
    const result = signIn(login, password);
    if (!result.ok) setError(result.message ?? 'Não foi possível entrar.');
  };

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.hero}>
        <BrandMark />
        <Text style={styles.kicker}>CUIDADO QUE CABE NA ROTINA</Text>
        <Text style={styles.title}>Tudo para seu pet, sem dar voltas.</Text>
        <Text style={styles.description}>Escolha os produtos, monte o carrinho e retire na loja.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Que bom ter você aqui</Text>
        <AppInput label="E-mail" value={login} onChangeText={(value) => { setLogin(value); setError(''); }} keyboardType="email-address" autoCapitalize="none" placeholder="voce@email.com" />
        <AppInput label="Senha" value={password} onChangeText={(value) => { setPassword(value); setError(''); }} secureTextEntry placeholder="Sua senha" />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton title="Entrar" onPress={submit} />
        <Text style={styles.demo}>Quer entrar rapidinho? Use tutor@petfacil.com com a senha pet123.</Text>
      </View>
      <View style={styles.signUpRow}>
        <Text style={styles.newHere}>Ainda não tem conta?</Text>
        <AppButton title="Criar minha conta" variant="secondary" onPress={() => navigation.navigate('SignUp')} style={styles.signUpButton} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'center', paddingVertical: 28 },
  hero: { gap: 10, marginBottom: 24 },
  kicker: { marginTop: 18, color: colors.cobalt, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.7 },
  title: { maxWidth: 430, color: colors.ink, fontFamily: fonts.display, fontSize: 38, lineHeight: 42 },
  description: { maxWidth: 430, color: colors.muted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 23 },
  card: { gap: 15, backgroundColor: colors.white, borderRadius: radius.lg, padding: 20, borderWidth: 1, borderColor: colors.line },
  cardTitle: { color: colors.ink, fontFamily: fonts.display, fontSize: 22 },
  error: { color: colors.danger, fontFamily: fonts.regular, fontSize: 13 },
  demo: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12, textAlign: 'center', lineHeight: 17 },
  signUpRow: { alignItems: 'center', gap: 10, marginTop: 20 },
  newHere: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14 },
  signUpButton: { width: '100%' },
});
