import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.booknest.app',
  appName: 'BookNest',
  webDir: 'dist',

  // Purpose: Allow Android WebView to request HTTP resources
  // while the local Capacitor app is loaded over HTTPS.
  android: {
    allowMixedContent: true,
  },
};

export default config;