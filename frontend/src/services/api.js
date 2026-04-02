import axios from "axios";
import { toast } from "react-toastify";

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
      } catch (refreshError) {
        window.location.href = "/login?expired=1";
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403) {
      toast.warn("لا يمكنك القيام بهذا الإجراء!", {
        position: "top-left", 
        theme: "colored",
        autoClose: 2000,
        closeButton: false,
      });
      return Promise.reject(error);
    }

    if (!error.response) {
      toast.error("خطأ في الاتصال بالخادم", {
        position: "top-left",
        theme: "colored",
        autoClose: 3000,
      });
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
    localStorage.setItem("role", data.role);
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
      localStorage.removeItem("role");
    } catch {}
  }
}
class FamilyAPI {
  // Family endpoints

  //unused
  async getAllFamilies() {
    const response = await apiClient.get("/families");
    return response.data;
  }

  async getByCode(code) {
    const response = await apiClient.get(`/families/${code}`);
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
    const response = await apiClient.get("/families/search", { params: sp });
    return response.data;
  }

  async getFamilyCount() {
    const response = await apiClient.get("/families/count");
    return response.data;
  }

  async getNonArchivedFamilyCount() {
    const response = await apiClient.get("/families/count/active");
    return response.data;
  }

  async updateFamily(family) {
    const response = await apiClient.put(`/families/${family.code}`, family);
    return response.data;
  }

  async addFamily(family) {
    const response = await apiClient.post("/families", family);
    return response.data;
  }

  async deleteFamily(code) {
    const response = await apiClient.delete(`/families/${code}`);
    return response.data;
  }
}

class SavedListAPI {
  async getList(listId) {
    const response = await apiClient.get(`/lists/${listId}`);
    return response.data;
  }

  async getAll() {
    const response = await apiClient.get("/lists");
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
    const response = await apiClient.get("/lists/campaigns");
    return response.data;
  }

  async update(listId, name, description, campaign) {
    const response = await apiClient.patch(`/lists/${listId}`, {
      name,
      description,
      campaign,
    });
    return response.data;
  }

  async updateNotes(entryId, newText) {
    const response = await apiClient.patch(`/lists/entries/${entryId}/notes`, {
      newNotes: newText,
    });
    return response.data;
  }

  async archive(listId) {
    const response = await apiClient.patch(`/lists/${listId}/archive`);
    return response.data;
  }

  async delete(listId) {
    const response = await apiClient.delete(`/lists/${listId}`);
    return response.data;
  }

  async addFamilies(listId, familyCodes) {
    const response = await apiClient.put(
      `/lists/${listId}/entries`,
      familyCodes,
    );
    return response.data;
  }

  async removeFamilies(listId, familyCodes) {
    const response = await apiClient.delete(`/lists/${listId}/entries`, {
      data: familyCodes,
    });
    return response.data;
  }

  async toggleDone(listId, familyId) {
    const response = await apiClient.patch(
      `/lists/${listId}/entries/${familyId}/toggle`,
    );
    return response.data;
  }

  async updateReport(listId, report) {
    const response = await apiClient.patch(`/lists/${listId}/report`, report, {
      headers: { "Content-Type": "text/plain" },
    });
    return response.data;
  }

  async exportList(
    listId,
    { residence = false, children = false, minDOB = null, maxDOB = null } = {},
  ) {
    const params = new URLSearchParams({ residence, children });
    if (minDOB != null) params.append("minDOB", minDOB);
    if (maxDOB != null) params.append("maxDOB", maxDOB);

    const response = await apiClient.get(
      `/lists/${listId}/export?${params.toString()}`,
      { responseType: "blob" },
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `list_${listId}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async getCount() {
    const response = await apiClient.get("/lists/count");
    return response.data;
  }
}
class AdminAPI {
  async getAccounts() {
    const response = await apiClient.get("/admin/accounts");
    return response.data;
  }

  async createSlotAccount(username, role) {
    const response = await apiClient.post(
      `/admin/accounts?username=${username}&role=${role}`,
    );
    return response.data;
  }

  async renameAccount(id, username) {
    const response = await apiClient.patch(
      `/admin/accounts/${id}/rename?username=${username}`,
    );
    return response.data;
  }

  async resetPassword(id) {
    const response = await apiClient.patch(
      `/admin/accounts/${id}/reset-password`,
    );
    return response.data;
  }

  async changeRole(id, role) {
    const response = await apiClient.patch(
      `/admin/accounts/${id}/role?role=${role}`,
    );
    return response.data;
  }

  async toggleAccount(id) {
    const response = await apiClient.patch(`/admin/accounts/${id}/toggle`);
    return response.data;
  }
  async deleteAccount(id) {
    const response = await apiClient.delete(`/admin/accounts/${id}/delete`);
    return response.data;
  }
}


export const adminAPI = new AdminAPI();
export const authAPI = new AuthAPI();
export const familyAPI = new FamilyAPI();
export const savedListAPI = new SavedListAPI();
export default apiClient;
