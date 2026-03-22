import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
  withCredentials: true,
});

let refreshPromise = null;

const performRefreshTokenFlow = async () => {
  if (refreshPromise) return refreshPromise;
  refreshPromise = axios
    .post(`${import.meta.env.VITE_API_URL}/auth/refresh`, null, {
      withCredentials: true,
    })
    .finally(() => (refreshPromise = null));
  return refreshPromise;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await performRefreshTokenFlow();
        return apiClient(originalRequest);
      } catch {
        window.location.href = "/login?expired=1";
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

class AuthAPI {
  async login(username, password) {
    const { data } = await apiClient.post("/auth/login", {
      username,
      password,
    });
    localStorage.setItem("username", data.username);
    return data;
  }

  async register(username, password, email) {
    const { data } = await apiClient.post(
      "/auth/register",
      {
        username,
        password,
        email,
      },
      { timeout: 60000 },
    );
    return data;
  }

  async logout() {
    try {
      await apiClient.post("/auth/logout");
      localStorage.removeItem("username");
    } catch {}
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
      `/family/delete?familyCode=${code}`,
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
      { name, description, campaign },
    );
    return response.data;
  }
  async updateNote(entryId, newText) {
    const response = await apiClient.patch(
      `/lists/updateNotes?entryId=${entryId}`,
      { newNotes: newText },
    );
    return response.data;
  }
  async archive(listId) {
    const response = await apiClient.patch(
      `/lists/archiveList?listId=${listId}`,
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
      familyCodes,
    );
    return response.data;
  }
  async toggleDone(listId, familyId) {
    const response = await apiClient.put(
      `/lists/toggleDone?listId=${listId}&familyId=${familyId}`,
    );
    return response.data;
  }

  async removeFamilies(listId, familyCodes) {
    const response = await apiClient.put(
      `/lists/removeFamilies?listId=${listId}`,
      familyCodes,
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
