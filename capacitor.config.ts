import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jeffinberg.focus',
  appName: 'Focus',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;