import { Fredoka_600SemiBold, useFonts as useFredoka } from '@expo-google-fonts/fredoka';
import { NunitoSans_400Regular, NunitoSans_600SemiBold, NunitoSans_700Bold, useFonts as useNunito } from '@expo-google-fonts/nunito-sans';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppProvider, useApp } from './src/contexts/AppContext';
import { CartScreen } from './src/screens/CartScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { OrderSuccessScreen } from './src/screens/OrderSuccessScreen';
import { ProductDetailScreen } from './src/screens/ProductDetailScreen';
import { ProductsScreen } from './src/screens/ProductsScreen';
import { SignUpScreen } from './src/screens/SignUpScreen';
import { colors, fonts } from './src/theme';
import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.paper, card: colors.paper, text: colors.ink, border: colors.line, primary: colors.cobalt },
};

function AppNavigator() {
  const { currentUser } = useApp();
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShadowVisible: false, headerStyle: { backgroundColor: colors.paper }, headerTitleStyle: { fontFamily: fonts.display, color: colors.ink }, headerTintColor: colors.ink, contentStyle: { backgroundColor: colors.paper } }}>
        {currentUser ? (
          <>
            <Stack.Screen name="Products" component={ProductsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Detalhes' }} />
            <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Meu carrinho' }} />
            <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} options={{ headerShown: false, gestureEnabled: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Criar conta' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fredokaLoaded] = useFredoka({ Fredoka_600SemiBold });
  const [nunitoLoaded] = useNunito({ NunitoSans_400Regular, NunitoSans_600SemiBold, NunitoSans_700Bold });
  if (!fredokaLoaded || !nunitoLoaded) return <View style={styles.loading}><ActivityIndicator size="large" color={colors.cobalt} /></View>;
  return <AppProvider><StatusBar style="dark" /><AppNavigator /></AppProvider>;
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper } });
