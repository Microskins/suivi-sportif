// filepath: client/src/api/client.ts
// API client with JWT authentication

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const result = await this.request<{ user: any; token: string }>('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(result.token);
    return result;
  }

  async register(email: string, password: string, name: string) {
    const result = await this.request<any>('/api/users', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    return result;
  }

  logout() {
    this.setToken(null);
  }

  // Users
  async getUsers() {
    return this.request<any[]>('/api/users');
  }

  async getUser(id: string) {
    return this.request<any>(`/api/users/${id}`);
  }

  // Exercises
  async getExercises() {
    return this.request<any[]>('/api/exercises');
  }

  async getExercise(id: string) {
    return this.request<any>(`/api/exercises/${id}`);
  }

  async createExercise(data: any) {
    return this.request<any>('/api/exercises', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExercise(id: string, data: any) {
    return this.request<any>(`/api/exercises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteExercise(id: string) {
    return this.request<void>(`/api/exercises/${id}`, {
      method: 'DELETE',
    });
  }

  // Workouts
  async getWorkouts() {
    return this.request<any[]>('/api/workouts');
  }

  async getWorkout(id: string) {
    return this.request<any>(`/api/workouts/${id}`);
  }

  async createWorkout(data: any) {
    return this.request<any>('/api/workouts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWorkout(id: string, data: any) {
    return this.request<any>(`/api/workouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWorkout(id: string) {
    return this.request<void>(`/api/workouts/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();