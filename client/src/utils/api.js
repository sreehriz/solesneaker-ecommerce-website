const API_URL = 'http://localhost:5000/api';

/**
 * Helper to perform HTTP requests with authorization headers.
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('soleforce_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

const api = {
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
    register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
    getProfile: () => request('/auth/profile'),
    updateCart: (cart) => request('/auth/cart', { method: 'PUT', body: { cart } }),
    updateWishlist: (wishlist) => request('/auth/wishlist', { method: 'PUT', body: { wishlist } })
  },
  products: {
    list: (category = '', brand = '') => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (brand) params.append('brand', brand);
      return request(`/products?${params.toString()}`);
    },
    search: (query) => request(`/products/search?q=${encodeURIComponent(query)}`),
    sort: (field, order) => request(`/products/sort?field=${field}&order=${order}`),
    get: (id) => request(`/products/${id}`)
  },
  orders: {
    list: () => request('/orders'),
    checkout: (orderData) => request('/orders/checkout', { method: 'POST', body: orderData }),
    optimize: (budget, items) => request('/orders/optimize', { method: 'POST', body: { budget, items } }),
    getBundles: (target) => request(`/orders/bundles?target=${target}`)
  },
  analytics: {
    getNQueens: (size) => request(`/analytics/nqueens?size=${size}`),
    getOBST: () => request('/analytics/obst'),
    getFloyd: () => request('/analytics/floyd'),
    getHamiltonian: (matrix) => request(`/analytics/hamiltonian?matrix=${encodeURIComponent(matrix)}`),
    getWarshall: (matrix) => request(`/analytics/warshall?matrix=${encodeURIComponent(matrix)}`)
  }
};

export default api;
