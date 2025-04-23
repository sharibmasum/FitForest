module.exports = {
  name: 'FitForest',
  slug: 'FitForest',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  scheme: 'fitforest',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#556B2F'
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.fitforest.app',
    config: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY_IOS
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#556B2F'
    },
    package: 'com.fitforest.app',
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY_ANDROID
      }
    }
  },
  web: {
    bundler: 'metro',
  },
  extra: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    eas: {
      projectId: 'b27594ad-098d-4e06-8141-521f491dfae6'
    }
  },
  plugins: [
    [
      "expo-location",
      {
        locationWhenInUsePermission: "Allow FitForest to use your location to find nearby gyms."
      }
    ]
  ]
}; 