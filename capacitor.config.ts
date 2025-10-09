import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.7d7b3591133e49a88e73a1f3401293b3',
  appName: 'Clinic Pharmacy Manager',
  webDir: 'dist',
  server: {
    url: 'https://7d7b3591-133e-49a8-8e73-a1f3401293b3.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0ea5e9',
      showSpinner: false
    }
  }
};

export default config;