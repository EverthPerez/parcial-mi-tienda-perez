import { productsRepo } from '@/db/repositories/products';
import type { Product } from '@/db/schema';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

export function isPending(p: Product) {
  return !p.syncedAt || p.syncedAt.getTime() < p.updatedAt.getTime();
}

export function useProducts() {
  const { data } = useLiveQuery(productsRepo.listQuery());
  const products = data ?? [];

  const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalValue = products.reduce((sum, p) => sum + p.quantity * p.price, 0);
  const pendingCount = products.filter(isPending).length;

  return { products, totalUnits, totalValue, pendingCount };
}