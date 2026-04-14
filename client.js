const BASE_URL = '/api';

/**
 * Enhanced fetch wrapper to automatically handle credentials (cookies),
 * JSON parsing, and basic error throwing based on status.
 */
export async function fetchApi(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    // Crucial for sending and receiving the JWT cookie automatically
    credentials: 'include', 
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error = new Error(data?.message || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}
