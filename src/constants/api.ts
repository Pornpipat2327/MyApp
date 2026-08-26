import { Platform } from 'react-native';

export const API_BASE_URL = 'http://119.59.102.161:3032';

export const getBaseUrl = (): string => {
  return API_BASE_URL;
};

export const getProductsApiUrl = (): string => {
  return `${API_BASE_URL}/api/products`;
};

export const getUploadApiUrl = (): string => {
  return `${API_BASE_URL}/api/upload`;
};

export const getLoginApiUrl = (): string => {
  return `${API_BASE_URL}/api/auth/login`;
};
