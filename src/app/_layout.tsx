import { AuthProvider, useAuth } from '@/context/AuthContext';
import { db } from '@/db/client';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import migrations from '../../drizzle/migrations';

function RootNavigator() {
  const { session, loading } = useAuth();
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text>Error en la base de datos: {error.message}</Text>
      </View>
    );
  }

  if (loading || !success) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="index" />
        <Stack.Screen name="producto" />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="login" />
        <Stack.Screen name="registro" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}