const DEFAULT_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const getBaseUrl = () => DEFAULT_BASE_URL.replace(/\/$/, '');

export class HttpError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export async function httpRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${getBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new HttpError(response.statusText, response.status, payload);
  }

  return payload as T;
}
