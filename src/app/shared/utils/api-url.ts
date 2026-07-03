export const BACKEND_API_URL = import.meta.env.NG_APP_BACKEND_API_URL;

if (!BACKEND_API_URL) {
  throw new Error('Missing NG_APP_BACKEND_API_URL. Check .env and restart the Angular dev server.');
}

export const BACKEND_BASE_URL = BACKEND_API_URL.replace(/\/api\/?$/, '');
