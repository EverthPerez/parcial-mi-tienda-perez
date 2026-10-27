import { useAuth } from '@/context/AuthContext';
import { productsRepo } from '@/db/repositories/products';
import { isPending, useProducts } from '@/hooks/useProducts';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const money = (n: number) => '$ ' + n.toLocaleString('es-CO');

export default function Principal() {
  const { signOut } = useAuth();
  const { products, totalUnits, totalValue, pendingCount } = useProducts();
  const [message, setMessage] = useState('');

  function handleSync() {
    setMessage('La sincronización se agrega en el Bloque 3');
  }

  function confirmDelete(id: number, name: string) {
    Alert.alert('Eliminar producto', `¿Eliminar "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => productsRepo.remove(id) },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Tienda</Text>
        <Pressable onPress={signOut}>
          <Text style={styles.logout}>Cerrar sesión</Text>
        </Pressable>
      </View>

      <View style={styles.totals}>
        <Text style={styles.totalText}>Unidades en total: {totalUnits}</Text>
        <Text style={styles.totalText}>Valor del inventario: {money(totalValue)}</Text>
        <Text style={styles.totalText}>Pendientes de subir: {pendingCount}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={[styles.button, { backgroundColor: '#2563eb' }]} onPress={handleSync}>
          <Text style={styles.buttonText}>Sincronizar</Text>
        </Pressable>
        <Pressable
          style={[styles.button, { backgroundColor: '#16a34a' }]}
          onPress={() => router.push('/producto')}
        >
          <Text style={styles.buttonText}>+ Agregar</Text>
        </Pressable>
      </View>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={<Text style={styles.empty}>Aún no hay productos. Toca "+ Agregar".</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.item}
            onPress={() => router.push({ pathname: '/producto', params: { id: String(item.id) } })}
            onLongPress={() => confirmDelete(item.id, item.name)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemInfo}>
                {item.quantity} unidades · {money(item.price)}
              </Text>
            </View>
            <Text style={isPending(item) ? styles.pending : styles.synced}>
              {isPending(item) ? '⏳ Pendiente' : '☁️ En la nube'}
            </Text>
          </Pressable>
        )}
      />
      <Text style={styles.hint}>Mantén presionado un producto para eliminarlo</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  title: { fontSize: 26, fontWeight: 'bold' },
  logout: { color: '#dc2626', fontWeight: 'bold' },
  totals: { backgroundColor: '#f1f5f9', borderRadius: 10, padding: 12, gap: 4 },
  totalText: { fontSize: 15 },
  actions: { flexDirection: 'row', gap: 10, marginVertical: 12 },
  button: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  message: { textAlign: 'center', marginBottom: 8, color: '#334155' },
  empty: { textAlign: 'center', marginTop: 32, color: '#64748b' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    marginBottom: 8,
  },
  itemName: { fontSize: 16, fontWeight: 'bold' },
  itemInfo: { color: '#475569', marginTop: 2 },
  pending: { color: '#d97706', fontWeight: 'bold' },
  synced: { color: '#16a34a', fontWeight: 'bold' },
  hint: { textAlign: 'center', color: '#94a3b8', fontSize: 12, paddingVertical: 6 },
});