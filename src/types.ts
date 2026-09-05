export type User = {
  fullName: string;
  cpf: string;
  login: string;
  password: string;
};

export type Product = {
  name: string;
  currentPrice: number;
  promotionalPrice: number;
  type: 'Ração' | 'Brinquedo' | 'Higiene' | 'Acessório';
  description: string;
  expirationDate: string;
};

export type Purchase = {
  productName: string;
  price: number;
  purchaseDate: string;
};

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Products: undefined;
  ProductDetail: { product: Product };
  Cart: undefined;
  OrderSuccess: { itemCount: number; total: number };
};
