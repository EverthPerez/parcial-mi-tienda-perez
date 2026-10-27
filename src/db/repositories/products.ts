import { desc, eq, isNull, lt, or } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';
import { db } from '../client';
import { products } from '../schema';

export type ProductInput = {
  name: string;
  quantity: number;
  price: number;
};

export const productsRepo = {
  listQuery() {
    return db.select().from(products).orderBy(desc(products.updatedAt));
  },

  async getById(id: number) {
    const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return rows[0] ?? null;
  },

  async create(input: ProductInput) {
    await db.insert(products).values({
      clientId: Crypto.randomUUID(),
      name: input.name,
      quantity: input.quantity,
      price: input.price,
      updatedAt: new Date(),
    });
  },

  async update(id: number, input: ProductInput) {
    await db
      .update(products)
      .set({
        name: input.name,
        quantity: input.quantity,
        price: input.price,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));
  },

  async remove(id: number) {
    await db.delete(products).where(eq(products.id, id));
  },

  // Usados en el Bloque 3 (sincronización)
  async getPending() {
    return db
      .select()
      .from(products)
      .where(or(isNull(products.syncedAt), lt(products.syncedAt, products.updatedAt)));
  },

  async getAllClientIds() {
    const rows = await db.select({ clientId: products.clientId }).from(products);
    return rows.map((r) => r.clientId);
  },

  async insertFromCloud(p: {
    clientId: string;
    name: string;
    quantity: number;
    price: number;
    updatedAt: Date;
  }) {
    await db.insert(products).values({
      clientId: p.clientId,
      name: p.name,
      quantity: p.quantity,
      price: p.price,
      updatedAt: p.updatedAt,
      syncedAt: p.updatedAt,
    });
  },

  async markSynced(id: number, syncedAt: Date) {
    await db.update(products).set({ syncedAt }).where(eq(products.id, id));
  },
};