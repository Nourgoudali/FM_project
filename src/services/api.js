import axios from "axios"

// Créer une instance axios avec l'URL de base de l'API
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gérer les erreurs 401 (non autorisé)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Services API pour les différentes entités
export const authService = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
}

export const userService = {
  getAll: () => api.get("/users"),
  getById: (id) => api.get(`/users/${id}`),
  create: (user) => api.post("/users", user),
  update: (id, user) => api.put(`/users/${id}`, user),
  delete: (id) => api.delete(`/users/${id}`),
}

export const equipmentService = {
  getAll: () => api.get("/equipments"),
  getById: (id) => api.get(`/equipments/${id}`),
  create: (equipment) => api.post("/equipments", equipment),
  update: (id, equipment) => api.put(`/equipments/${id}`, equipment),
  delete: (id) => api.delete(`/equipments/${id}`),
}

export const interventionService = {
  getAll: () => api.get("/interventions"),
  getById: (id) => api.get(`/interventions/${id}`),
  create: (intervention) => api.post("/interventions", intervention),
  update: (id, intervention) => api.put(`/interventions/${id}`, intervention),
  delete: (id) => api.delete(`/interventions/${id}`),
}

export const stockService = {
  getAll: () => api.get("/stock"),
  getById: (id) => api.get(`/stock/${id}`),
  create: (item) => api.post("/stock", item),
  update: (id, item) => api.put(`/stock/${id}`, item),
  delete: (id) => api.delete(`/stock/${id}`),
  updateQuantity: (id, operation, quantity) => api.patch(`/stock/${id}/quantity`, { operation, quantity }),
}

export const documentService = {
  getAll: () => api.get("/documents"),
  getById: (id) => api.get(`/documents/${id}`),
  create: (formData) =>
    api.post("/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, document) => api.put(`/documents/${id}`, document),
  delete: (id) => api.delete(`/documents/${id}`),
}
