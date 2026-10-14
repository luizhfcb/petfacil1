import { Order, Product, User } from '../types';

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string>;

  constructor(message: string, status: number, errors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export type RegisterInput = {
  fullName: string;
  email: string;
  cpf: string;
  password: string;
  passwordConfirmation: string;
};

export type OrderResult = { itemCount: number; total: number };

type FetchLike = typeof fetch;
type RequestOptions = { method?: 'GET' | 'POST'; body?: unknown };
type ErrorBody = { message?: string; errors?: Record<string, string> };

export function createApiClient(baseUrl: string, fetchImpl: FetchLike = fetch, timeoutMs = 10000) {
  let token: string | null = null;

  async function request<T>(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      let response: Response;
      try {
        response = await fetchImpl(`${baseUrl}${path}`, {
          method,
          headers,
          body: body === undefined ? undefined : JSON.stringify(body),
          signal: controller.signal,
        });
      } catch {
        throw new ApiError(`Não foi possível conectar em ${baseUrl}. Verifique se a API está rodando e se o endereço está correto.`, 0);
      }

      const data = (await response.json().catch(() => ({}))) as ErrorBody;
      if (!response.ok) {
        throw new ApiError(data.message ?? 'Algo deu errado. Tente novamente.', response.status, data.errors);
      }
      return data as T;
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    setToken(value: string | null) {
      token = value;
    },

    async login(login: string, password: string): Promise<User> {
      const data = await request<{ token: string; user: User }>('/api/auth/login', { method: 'POST', body: { login, password } });
      token = data.token;
      return { fullName: data.user.fullName, cpf: data.user.cpf, login: data.user.login };
    },

    async register(input: RegisterInput): Promise<void> {
      await request('/api/auth/register', { method: 'POST', body: input });
    },

    async products(): Promise<Product[]> {
      const data = await request<{ products: Product[] }>('/api/products');
      return data.products;
    },

    async createOrder(cart: Product[]): Promise<OrderResult> {
      const quantities = new Map<string, number>();
      for (const product of cart) quantities.set(product.id, (quantities.get(product.id) ?? 0) + 1);
      const items = [...quantities].map(([productId, quantity]) => ({ productId, quantity }));
      const data = await request<OrderResult>('/api/orders', { method: 'POST', body: { items } });
      return { itemCount: data.itemCount, total: data.total };
    },

    async orders(): Promise<Order[]> {
      const data = await request<{ orders: Order[] }>('/api/orders');
      return data.orders;
    },

    async ask(question: string): Promise<string> {
      const data = await request<{ answer: string }>('/api/assistant', { method: 'POST', body: { question } });
      return data.answer;
    },
  };
}
