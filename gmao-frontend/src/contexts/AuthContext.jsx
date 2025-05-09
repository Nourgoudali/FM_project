"use client"

import { createContext, useState, useContext, useEffect, useCallback } from "react"
import { api } from "../services/api"

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await api.get("/users/profile")
      setCurrentUser(response.data)
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error)
      // Inline logout logic instead of calling logout
      localStorage.removeItem("token")
      delete api.defaults.headers.common["Authorization"]
      setCurrentUser(null)
    } finally {
      setLoading(false)
    }
  }, []) // No dependencies needed now

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté (token dans localStorage)
    const token = localStorage.getItem("token")
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      fetchUserProfile()
    } else {
      setLoading(false)
    }
  }, [fetchUserProfile])

  const login = async (email, password) => {
    try {
      // Dans un environnement réel, vous appelleriez l'API
      // const response = await api.post("/auth/login", { email, password })
      // const { token, user } = response.data

      // Pour la démo, simulons une connexion réussie
      const token = "fake-jwt-token"
      const user = {
        id: 1,
        name: "AYA AYA",
        email: email,
        role: "Administrateur",
      }

      localStorage.setItem("token", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      setCurrentUser(user)
      return user
    } catch (error) {
      throw new Error(error.response?.data?.message || "Erreur de connexion")
    }
  }

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    delete api.defaults.headers.common["Authorization"]
    setCurrentUser(null)
  }, [])

  const value = {
    currentUser,
    login,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
