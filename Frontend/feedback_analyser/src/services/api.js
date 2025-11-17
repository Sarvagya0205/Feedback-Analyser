// API service for backend communication
import { getSettings } from '../utils/storage'

export const getApiUrl = () => {
  const settings = getSettings()
  return settings.apiUrl || import.meta.env.VITE_API_URL || 'http://localhost:5500'
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const analyzeFeedback = async (text) => {
  try {
    const apiUrl = getApiUrl()
    const response = await fetch(`${apiUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to analyze feedback')
    }

    return await response.json()
  } catch (error) {
    throw error
  }
}

