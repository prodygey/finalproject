
/*
Purpose:
- Send HTTP requests from Ionic to Express.
- Attach the login token to protected requests.
- Convert API errors into readable messages.
*/

// Purpose: Store the API base URL in one place.
const API_URL = 'http://172.20.10.6:3000/api';

// Purpose: Define the shape of the API response data.
type ApiOptions = {
  method?: string;
  token?: string;
  body?: unknown;
};

// Purpose: Make an API request and return its JSON response.
export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Purpose: Send a token when a request requires authentication.
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  // Purpose: Send the request to the Express API.
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body:
      options.body === undefined
        ? undefined
        : JSON.stringify(options.body),
  });

  // Purpose: Parse the JSON response returned by Express.
  const data = await response.json().catch(() => ({}));

  // Purpose: Report server errors to the calling page.
  if (!response.ok) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data as T;
}
