import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Platform, useColorScheme } from 'react-native';
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink } from '@apollo/client';
import Constants from 'expo-constants';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

function getApiUri() {
  if (Platform.OS === 'web') {
    return 'http://localhost:4000/';
  }

  // In Expo, hostUri usually looks like "192.168.x.x:8081".
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as unknown as { manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } } })
      .manifest2?.extra?.expoGo?.debuggerHost;
  const host = hostUri?.split(':')[0];

  if (host) {
    return `http://${host}:4000/`;
  }

  // Android emulator cannot reach host machine via localhost.
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000/';
  }

  return 'http://localhost:4000/';
}

// Create the Apollo Client
const client = new ApolloClient({
  link: new HttpLink({ uri: getApiUri() }),
  cache: new InMemoryCache(),
});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ApolloProvider client={client}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <AppTabs />
      </ThemeProvider>
    </ApolloProvider>
  );
}