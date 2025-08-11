// API service for backend communication

const API_BASE_URL = import.meta.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : 'http://localhost:8000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GoogleAuthRequest {
  google_id: string;
  email: string;
  name: string;
  profile_image?: string;
  referral_code?: string;
}

export interface GoogleAuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    profile_image?: string;
    user_role: string;
    coins_balance: number;
    referral_code: string;
    location: {
      city?: string;
      state?: string;
      latitude?: number;
      longitude?: number;
    };
  };
  is_new_user: boolean;
  tokens: {
    access_token: string;
    refresh_token: string;
  };
}

class ApiService {
  private baseURL = `${API_BASE_URL}/api/v1`;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage on initialization
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage() {
    this.accessToken = localStorage.getItem('pawhood_access_token');
    this.refreshToken = localStorage.getItem('pawhood_refresh_token');
  }

  private saveTokensToStorage(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('pawhood_access_token', accessToken);
    localStorage.setItem('pawhood_refresh_token', refreshToken);
  }

  private clearTokensFromStorage() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('pawhood_access_token');
    localStorage.removeItem('pawhood_refresh_token');
  }

  private async makeRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Add authorization header if token exists
    if (this.accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.accessToken}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // If token expired, try to refresh
        if (response.status === 401 && this.refreshToken) {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            // Retry the original request with new token
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${this.accessToken}`,
            };
            const retryResponse = await fetch(url, config);
            const retryData = await retryResponse.json();
            
            if (!retryResponse.ok) {
              throw new Error(retryData.error || 'Request failed');
            }
            
            return retryData;
          }
        }
        
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.refreshToken && { Authorization: `Bearer ${this.refreshToken}` }),
        },
      });

      if (!response.ok) {
        this.clearTokensFromStorage();
        return false;
      }

      const data = await response.json();
      
      if (data.success && data.data.access_token) {
        this.accessToken = data.data.access_token;
        localStorage.setItem('pawhood_access_token', this.accessToken);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokensFromStorage();
      return false;
    }
  }

  // Authentication methods
  async authenticateWithGoogle(authData: GoogleAuthRequest): Promise<ApiResponse<GoogleAuthResponse>> {
    const response = await this.makeRequest<GoogleAuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(authData),
    });

    if (response.success && response.data) {
      // Save tokens
      this.saveTokensToStorage(
        response.data.tokens.access_token,
        response.data.tokens.refresh_token
      );
    }

    return response;
  }

  async logout(): Promise<void> {
    this.clearTokensFromStorage();
    // Could add server-side logout endpoint here if needed
  }

  // Profile methods
  async getProfile(): Promise<ApiResponse> {
    return this.makeRequest('/profile');
  }

  async updateProfile(data: any): Promise<ApiResponse> {
    return this.makeRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Pet methods
  async addPet(petData: any): Promise<ApiResponse> {
    return this.makeRequest('/pets', {
      method: 'POST',
      body: JSON.stringify(petData),
    });
  }

  async updatePet(petId: string, petData: any): Promise<ApiResponse> {
    return this.makeRequest(`/pets/${petId}`, {
      method: 'PUT',
      body: JSON.stringify(petData),
    });
  }

  async getPet(petId: string): Promise<ApiResponse> {
    return this.makeRequest(`/pets/${petId}`);
  }

  // Event methods
  async getNearbyEvents(params: {
    search_type?: string;
    latitude?: number;
    longitude?: number;
    radius_km?: number;
    city?: string;
    state?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/events/nearby${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async getEventDetails(eventId: string): Promise<ApiResponse> {
    return this.makeRequest(`/events/${eventId}`);
  }

  async registerForEvent(eventId: string, petIds: string[] = []): Promise<ApiResponse> {
    return this.makeRequest(`/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify({ pet_ids: petIds }),
    });
  }

  async createEvent(eventData: any): Promise<ApiResponse> {
    return this.makeRequest('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return fetch(`${API_BASE_URL}/api/health`)
      .then(response => response.json())
      .catch(error => ({
        success: false,
        error: error.message,
      }));
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Get current access token
  getAccessToken(): string | null {
    return this.accessToken;
  }
}

export const apiService = new ApiService();