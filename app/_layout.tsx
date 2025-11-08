// template
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RecoveryProvider, useRecovery } from '@/contexts/RecoveryContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { trpc, trpcClient } from '@/lib/trpc';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="panic" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="struggle" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="tree-detail" options={{ presentation: 'modal' }} />
      <Stack.Screen name="tracker" options={{ presentation: 'modal' }} />
      <Stack.Screen name="community-chat" options={{ presentation: 'modal' }} />
      <Stack.Screen name="ai-chat" options={{ presentation: 'modal' }} />
      <Stack.Screen name="todos" options={{ presentation: 'modal' }} />
      <Stack.Screen name="progress" options={{ presentation: 'modal' }} />
      <Stack.Screen name="knowledge-feed" options={{ presentation: 'modal' }} />
      <Stack.Screen name="journal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="habits" options={{ presentation: 'modal' }} />
      <Stack.Screen name="mood-tracker" options={{ presentation: 'modal' }} />
      <Stack.Screen name="micro-lessons" options={{ presentation: 'modal' }} />
      <Stack.Screen name="analytics" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

function RootContent() {
  const { onboardingCompleted, isLoading } = useRecovery();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!onboardingCompleted) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [isLoading, onboardingCompleted]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  return <RootLayoutNav />;
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RecoveryProvider>
            <RootContent />
          </RecoveryProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F2027',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
