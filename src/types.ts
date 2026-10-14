export type User = {
  fullName: string;
  cpf: string;
  login: string;
};

export type Product = {
  id: string;
  name: string;
  currentPrice: number;
  promotionalPrice: number;
  type: 'Ração' | 'Brinquedo' | 'Higiene' | 'Acessório';
  description: string;
  expirationDate: string;
};

export type OrderItem = {
  product: string;
  productName: string;
  price: number;
};

export type Order = {
  id: string;
  items: OrderItem[];
  itemCount: number;
  total: number;
  status: string;
  paymentMethod: string;
  purchaseDate: string;
};

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Products: undefined;
  ProductDetail: { product: Product };
  Cart: undefined;
  History: undefined;
  OrderSuccess: { itemCount: number; total: number };
};
