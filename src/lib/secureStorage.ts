import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const CHUNK_SIZE = 1800;
const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

export const SecureStorageAdapter = {
  async getItem(key: string): Promise<string | null> {
    if (!isNative) return null;
    const count = await SecureStore.getItemAsync(`${key}_count`);
    if (!count) return null;
    let value = '';
    for (let i = 0; i < Number(count); i++) {
      const chunk = await SecureStore.getItemAsync(`${key}_${i}`);
      if (chunk === null) return null;
      value += chunk;
    }
    return value;
  },

  async setItem(key: string, value: string): Promise<void> {
    if (!isNative) return;
    await SecureStorageAdapter.removeItem(key);
    const total = Math.ceil(value.length / CHUNK_SIZE);
    for (let i = 0; i < total; i++) {
      await SecureStore.setItemAsync(
        `${key}_${i}`,
        value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
      );
    }
    await SecureStore.setItemAsync(`${key}_count`, String(total));
  },

  async removeItem(key: string): Promise<void> {
    if (!isNative) return;
    const count = await SecureStore.getItemAsync(`${key}_count`);
    if (count) {
      for (let i = 0; i < Number(count); i++) {
        await SecureStore.deleteItemAsync(`${key}_${i}`);
      }
      await SecureStore.deleteItemAsync(`${key}_count`);
    }
  },
};