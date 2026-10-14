import { Platform } from 'react-native';

/**
 * Endereço da API do PetFacil.
 *
 * - Emulador Android: http://10.0.2.2:3000 (apelido do localhost do computador)
 * - iOS Simulator e navegador (web): http://localhost:3000
 * - Celular físico: defina EXPO_PUBLIC_API_URL com o IP do computador na rede,
 *   por exemplo: EXPO_PUBLIC_API_URL=http://192.168.0.10:3000 npm start
 */
const defaultUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? defaultUrl).replace(/\/+$/, '');
