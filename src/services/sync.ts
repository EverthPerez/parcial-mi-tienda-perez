
import { productsRepo } from '@/db/repositories/products';
import { supabase } from '@/lib/supabase';

export type SyncResult = {
  uploaded: number;
  downloaded: number;
};

export async function syncProducts(userId: string): Promise<SyncResult> {
  // 1. BAJAR: traer de Supabase lo que no existe en el teléfono
  const { data, error } = await supabase.from('products').select('*').eq('user_id', userId);
  if (error) throw new Error(error.message);

  const localIds = new Set(await productsRepo.getAllClientIds());
  let downloaded = 0;

  for (const row of data ?? []) {
    if (!localIds.has(row.client_id)) {
      await productsRepo.insertFromCloud({
        clientId: row.client_id,
        name: row.name,
        quantity: row.quantity,
        price: row.price,
        updatedAt: new Date(row.updated_at),
      });
      downloaded++;
    }
  }

  // 2. SUBIR: enviar los pendientes con upsert por client_id
  const pending = await productsRepo.getPending();

  if (pending.length > 0) {
    const rows = pending.map((p) => ({
      client_id: p.clientId,
      name: p.name,
      quantity: p.quantity,
      price: p.price,
      updated_at: p.updatedAt.toISOString(),
    }));

    const { error: upError } = await supabase
      .from('products')
      .upsert(rows, { onConflict: 'client_id' });
    if (upError) throw new Error(upError.message);

    for (const p of pending) {
      await productsRepo.markSynced(p.id, p.updatedAt);
    }
  }

  return { uploaded: pending.length, downloaded };
}