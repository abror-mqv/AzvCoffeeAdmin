import packageJson from '../package.json';

// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  appVersion: string;
};

const { VITE_API_BASE_URL, VITE_APP_NAME } = import.meta.env as Record<string, string | undefined>;

export const CONFIG: ConfigValue = {
  appName: VITE_APP_NAME || 'AZV Coffee Admin',
  appVersion: packageJson.version,
};

export const API_BASE_URL = VITE_API_BASE_URL || 'http://176.126.164.86:8001';
export const API_ROUTES = {
  LOGIN: '/api/manager/login/',
};
