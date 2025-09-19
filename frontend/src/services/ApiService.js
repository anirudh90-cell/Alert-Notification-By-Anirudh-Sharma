class ApiService {
  static currentUserId = null;

  static setUserId(userId) {
    this.currentUserId = userId;
  }

  static buildHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.currentUserId) headers['x-user-id'] = this.currentUserId;
    return headers;
  }

  static async get(endpoint) {
    const res = await fetch(endpoint, { headers: this.buildHeaders() });
    if (!res.ok) throw new Error(`GET ${endpoint} failed`);
    return res.json();
  }

  static async post(endpoint, data) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!res.ok) throw new Error(`POST ${endpoint} failed`);
    return res.json();
  }

  static async put(endpoint, data) {
    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: this.buildHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`PUT ${endpoint} failed`);
    return res.json();
  }
}

export default ApiService;


