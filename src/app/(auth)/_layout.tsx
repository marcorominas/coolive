// src/app/(auth)/_layout.tsx

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Stack, Redirect } from 'expo-router';

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  // Si ja està autenticat, el redirigim a la pàgina protegida arrel.
  if (isAuthenticated) {
    // Això el redirigirà a qualsevol fitxer que es pugui servir
    // a /src/app/(protected)/index.tsx (si n’hi ha) o bé /
    return <Redirect href='/(protected)/' />;
  }

  // Si no està autenticat, renderitzem la Stack amb /login i /signup
  return (
    <Stack initialRouteName="login">
             

      <Stack.Screen
        name="login"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="signup"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
