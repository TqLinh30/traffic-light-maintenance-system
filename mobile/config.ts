import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const googleMapsConfig = {
  apiKey: process.env.GOOGLE_KEY
};

// Default API URL from Expo config
const defaultApiUrl = Constants.expoConfig.extra.API_URL;
export const IS_LOCALHOST = false;

const normalizeApiUrl = (apiUrl: string): string => {
  const trimmedApiUrl = apiUrl.trim();
  return trimmedApiUrl.endsWith('/') ? trimmedApiUrl : `${trimmedApiUrl}/`;
};

// Function to get the API URL (either custom or default)
export const getApiUrl = async (): Promise<string> => {
  const customUrl = await AsyncStorage.getItem('customApiUrl');
  const rawApiUrl = customUrl?.trim() || defaultApiUrl?.trim();

  if (!rawApiUrl) {
    throw new Error(
      'API URL is not configured. Open Custom Server and enter a reachable server URL, or rebuild the app with API_URL.'
    );
  }

  return normalizeApiUrl(rawApiUrl);
};
