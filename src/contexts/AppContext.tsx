import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { Product, Purchase, User } from '../types';

type AppContextValue = {
  currentUser: User | null;
  cart: Product[];
  purchases: Purchase[];
  signUp: (user: User) => { ok: boolean; message?: string };
  signIn: (login: string, password: string) => { ok: boolean; message?: string };
  signOut: () => void;
  addToCart: (product: Product) => void;
  removeFromCart: (index: number) => void;
  finishOrder: () => { itemCount: number; total: number };
};

const demoUser: User = {
  fullName: 'Tutor PetFacil',
  cpf: '52998224725',
  login: 'tutor@petfacil.com',
  password: 'pet123',
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: PropsWithChildren) {
  const [users, setUsers] = useState<User[]>([demoUser]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cart, setCart] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  const value = useMemo<AppContextValue>(() => ({
    currentUser,
    cart,
    purchases,
    signUp: (user) => {
      if (users.some((registered) => registered.cpf === user.cpf || registered.login.toLowerCase() === user.login.toLowerCase())) {
        return { ok: false, message: 'Já existe uma conta com este CPF ou e-mail.' };
      }
      setUsers((current) => [...current, user]);
      return { ok: true };
    },
    signIn: (login, password) => {
      const user = users.find((registered) => registered.login.toLowerCase() === login.trim().toLowerCase() && registered.password === password);
      if (!user) return { ok: false, message: 'E-mail ou senha não conferem.' };
      setCurrentUser(user);
      return { ok: true };
    },
    signOut: () => {
      setCurrentUser(null);
      setCart([]);
    },
    addToCart: (product) => setCart((current) => [...current, product]),
    removeFromCart: (index) => setCart((current) => current.filter((_, itemIndex) => itemIndex !== index)),
    finishOrder: () => {
      const purchaseDate = new Date().toISOString();
      const createdPurchases = cart.map((product) => ({
        productName: product.name,
        price: product.promotionalPrice,
        purchaseDate,
      }));
      const result = {
        itemCount: cart.length,
        total: cart.reduce((sum, product) => sum + product.promotionalPrice, 0),
      };
      setPurchases((current) => [...current, ...createdPurchases]);
      setCart([]);
      return result;
    },
  }), [cart, currentUser, purchases, users]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp precisa estar dentro de AppProvider');
  return context;
}
