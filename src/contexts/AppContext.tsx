import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { api, ApiError } from '../services/api';
import { RegisterInput } from '../services/apiClient';
import { Product, User } from '../types';

type Result = { ok: true } | { ok: false; message: string };
type OrderOutcome = { ok: true; itemCount: number; total: number } | { ok: false; message: string };

type AppContextValue = {
  currentUser: User | null;
  cart: Product[];
  signUp: (input: RegisterInput) => Promise<Result>;
  signIn: (login: string, password: string) => Promise<Result>;
  signOut: () => void;
  addToCart: (product: Product) => void;
  removeFromCart: (index: number) => void;
  finishOrder: () => Promise<OrderOutcome>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    const firstFieldError = error.errors ? Object.values(error.errors)[0] : undefined;
    return firstFieldError ?? error.message;
  }
  return fallback;
}

export function AppProvider({ children }: PropsWithChildren) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cart, setCart] = useState<Product[]>([]);

  const value = useMemo<AppContextValue>(() => {
    const signOut = () => {
      api.setToken(null);
      setCurrentUser(null);
      setCart([]);
    };

    return {
      currentUser,
      cart,
      signUp: async (input) => {
        try {
          await api.register(input);
          return { ok: true };
        } catch (error) {
          return { ok: false, message: errorMessage(error, 'Não foi possível criar a conta.') };
        }
      },
      signIn: async (login, password) => {
        try {
          setCurrentUser(await api.login(login.trim(), password));
          return { ok: true };
        } catch (error) {
          return { ok: false, message: errorMessage(error, 'Não foi possível entrar.') };
        }
      },
      signOut,
      addToCart: (product) => setCart((current) => [...current, product]),
      removeFromCart: (index) => setCart((current) => current.filter((_, itemIndex) => itemIndex !== index)),
      finishOrder: async () => {
        try {
          const result = await api.createOrder(cart);
          setCart([]);
          return { ok: true, ...result };
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) signOut();
          return { ok: false, message: errorMessage(error, 'Não foi possível finalizar o pedido.') };
        }
      },
    };
  }, [cart, currentUser]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp precisa estar dentro de AppProvider');
  return context;
}
