import axios from "axios";

// Token management utilities
const getAccessToken = () => localStorage.getItem("access_token");
const getRefreshToken = () => localStorage.getItem("refresh_token");
const getUsername = () => localStorage.getItem("username");

const setusername = (username) => {
  localStorage.setItem("username", username);
};
const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
};
const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};
const clearUsername = () => {
  localStorage.removeItem("username");
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Track if we're currently refreshing to avoid multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor for adding auth tokens
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // No refresh token available
        clearSession();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Call refresh endpoint
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = response.data.access_token;
        localStorage.setItem("access_token", newAccessToken);

        // Process queued requests
        processQueue(null, newAccessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - both tokens are invalid
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API Class
class AuthAPI {
  async login(username, password) {
    const response = await apiClient.post("/auth/login", {
      username,
      password,
    });

    setusername(username);
    // Store tokens if login successful
    if (response.data.access_token && response.data.refresh_token) {
      setTokens(response.data.access_token, response.data.refresh_token);
    }

    return response.data;
  }

  async register(username, password) {
    const response = await apiClient.post("/auth/register", {
      username,
      password,
    });

    setusername(username);
    // Store tokens if registration successful (your backend returns tokens on register)
    if (response.data.access_token && response.data.refresh_token) {
      setTokens(response.data.access_token, response.data.refresh_token);
    }

    return response.data;
  }

  async logout() {
    const refreshToken = localStorage.getItem("refresh_token");
    try {
      if (refreshToken) {
        await apiClient.post("/auth/logout", {
          username: getUsername(),
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearSession();
    }
  }

  async refreshToken() {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await apiClient.post("/auth/refresh", {
      refresh_token: refreshToken,
    });

    if (response.data.access_token) {
      localStorage.setItem("access_token", response.data.access_token);
    }

    return response.data;
  }

  // Utility methods
  isAuthenticated() {
    return !!getAccessToken();
  }

  getTokens() {
    return {
      accessToken: getAccessToken(),
      refreshToken: getRefreshToken(),
    };
  }

  clearSession() {
    clearTokens();
    clearUsername();
  }
}

class FamilyAPI {
  // Family endpoints

  //unused
  async getAllFamilies() {
    const response = await apiClient.get("/family/listAll");
    return response.data;
  }

  async getByCode(code) {
    const response = await apiClient.get(`/family/getFamily?code=${code}`);
    return response.data;
  }
  async searchFamilies(params = {}) {
    // Build URLSearchParams with repeated keys for arrays
    const sp = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      // If value is an array, append each element with same key
      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (v !== undefined && v !== null && v !== "") {
            sp.append(key, v);
          }
        });
      } else if (
        typeof value === "boolean" ||
        typeof value === "number" ||
        typeof value === "string"
      ) {
        if (value !== "") sp.append(key, String(value));
      } else {
        // fallback: JSON stringify (rare)
        sp.append(key, JSON.stringify(value));
      }
    });

    // Call backend with archiveOption directly
    const response = await apiClient.get("/family/search", { params: sp });
    return response.data;
  }

  async getArchivedFamilies() {
    const response = await apiClient.get("/family/getArchived");
    return response.data;
  }
  async getFamilyCount() {
    const response = await apiClient.get("/family/allCount");
    return response.data;
  }

  async getNonArchivedFamilyCount() {
    const response = await apiClient.get("/family/nonArchivedCount");
    return response.data;
  }

  async updateFamily(family) {
    const response = await apiClient.put("/family/update", family);
    return response.data;
  }

  async addFamily(family) {
    const response = await apiClient.post("/family/add", family);
    return response.data;
  }

  async deleteFamily(code) {
    const response = await apiClient.delete(
      `/family/delete?familyCode=${code}`
    );
    return response.data;
  }
}

//TODO: improve the endpoints
class SavedListAPI {
  async getList(listId) {
    const response = await apiClient.get(`/lists/getList?id=${listId}`);
    return response.data;
  }

  async getAll() {
    const response = await apiClient.get("/lists/listAll");
    return response.data;
  }

  async create(list) {
    const toSend = {
      name: list.name,
      description: list.description,
      campaign: list.campaign,
      familyCodes: list.localCodes,
    };
    const response = await apiClient.post("/lists", toSend);
    return response.data;
  }
  async getCampaigns() {
    const response = await apiClient.get("/lists/getCampaigns");
    return response.data;
  }

  async update(listId, name, description, campaign) {
    const response = await apiClient.patch(
      `/lists/updateList?listId=${listId}`,
      { name, description, campaign }
    );
    return response.data;
  }
  async updateNote(entryId, newText) {
    const response = await apiClient.patch(
      `/lists/updateNotes?entryId=${entryId}`,
      { newNotes: newText }
    );
    return response.data;
  }
  async archive(listId) {
    const response = await apiClient.patch(
      `/lists/archiveList?listId=${listId}`
    );
    return response.data;
  }

  async delete(listId) {
    const response = await apiClient.delete(`/lists/delete?id=${listId}`);
    return response.data;
  }

  async addFamilies(listId, familyCodes) {
    const response = await apiClient.put(
      `/lists/addFamilies?listId=${listId}`,
      familyCodes
    );
    return response.data;
  }
  async toggleDone(listId, familyId) {
    const response = await apiClient.put(`/lists/toggleDone?listId=${listId}&familyId=${familyId}`);
    return response.data;
  }

  async removeFamilies(listId, familyCodes) {
    const response = await apiClient.put(
      `/lists/removeFamilies?listId=${listId}`,
      familyCodes
    );
    return response.data;
  }

  async getCount() {
    const response = await apiClient.get("/lists/getCount");
    return response.data;
  }
}

export const authAPI = new AuthAPI();
export const familyAPI = new FamilyAPI();
export const savedListAPI = new SavedListAPI();
export default apiClient;
