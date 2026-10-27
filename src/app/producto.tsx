import { productsRepo } from '@/db/repositories/products';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Producto() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = !!id;

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    productsRepo.getById(Number(id)).then((p) => {
      if (p) {
        setName(p.name);
        setQuantity(String(p.quantity));
        setPrice(String(p.price));
      }
    });
  }, [id]);

  async function handleSave() {
    setError('');
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!/^\d+$/.test(quantity.trim())) {
      setError('La cantidad debe ser un número entero mayor o igual a 0');
      return;
    }
    if (!/^\d+$/.test(price.trim())) {
      setError('El precio debe ser un número entero mayor o igual a 0');
      return;
    }

    const input = {
      name: name.trim(),
      quantity: Number(quantity),
      price: Number(price),
    };

    if (editing) {
      await productsRepo.update(Number(id), input);
    } else {
      await productsRepo.create(input);
    }
    router.back();
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{editing ? 'Editar producto' : 'Nuevo producto'}</Text>

        <Text style={styles.label}>Nombre</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ej: Arroz 500 g" />

        <Text style={styles.label}>Cantidad (unidades)</Text>
        <TextInput
          style={styles.input}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="number-pad"
          placeholder="Ej: 20"
        />

        <Text style={styles.label}>Precio (pesos)</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          keyboardType="number-pad"
          placeholder="Ej: 3500"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={[styles.button, { backgroundColor: '#2563eb' }]} onPress={handleSave}>
          <Text style={styles.buttonText}>Guardar</Text>
        </Pressable>
        <Pressable style={[styles.button, { backgroundColor: '#64748b' }]} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
  title: { fontSize: 26, fontWeight: 'bold', marginVertical: 16 },
  label: { fontWeight: 'bold', marginBottom: 4, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
  error: { color: '#c00', marginTop: 12, textAlign: 'center' },
  button: { padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});