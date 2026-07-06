import { environment } from '../../../environments/environment';

export const BACKEND_API_URL = environment.backendApiUrl;

if (!BACKEND_API_URL) {
  throw new Error(
    'Missing backendApiUrl. Check src/environments/environment.ts and restart the Angular dev server.',
  );
}

export const BACKEND_BASE_URL = BACKEND_API_URL.replace(/\/api\/?$/, '');
