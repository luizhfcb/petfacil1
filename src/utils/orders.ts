import { OrderItem } from '../types';

export type GroupedItem = { name: string; quantity: number; subtotal: number };

/** Junta itens repetidos de um pedido: 2x Ração A, 1x Bola B... */
export function groupOrderItems(items: OrderItem[]): GroupedItem[] {
  const groups = new Map<string, GroupedItem>();
  for (const item of items) {
    const current = groups.get(item.productName) ?? { name: item.productName, quantity: 0, subtotal: 0 };
    current.quantity += 1;
    current.subtotal = Math.round((current.subtotal + item.price) * 100) / 100;
    groups.set(item.productName, current);
  }
  return [...groups.values()];
}
