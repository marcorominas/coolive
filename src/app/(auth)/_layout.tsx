// src/app/(auth)/_layout.tsx

import { useAuth } from '@/providers/AuthProvider';
import { Stack, Redirect } from 'expo-router';

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  // Si ya está logueado, vamos a la raíz ("/"), NO a "/(protected)/"
  if (isAuthenticated) {
    return <Redirect href='/(protected)/' />;
  }

  return (
    <Stack>
      <Stack.Screen name='login' options={{ headerShown: false }} />
      <Stack.Screen
        name='signup'
        options={{
          title: 'Sign Up',
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
    </Stack>
  );
}
