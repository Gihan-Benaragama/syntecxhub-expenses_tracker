import axios from 'axios'

const BASE_URL = 'http://localhost:5000/api'

// Add request interceptor to attach JWT token
axios.interceptors.request.use(
    (config) => {
        const user = localStorage.getItem('user')
        if (user) {
            try {
                const parsed = JSON.parse(user)
                if (parsed && parsed.token) {
                    config.headers.Authorization = `Bearer ${parsed.token}`
                }
            } catch (e) {
                console.error('Error parsing user token from localStorage:', e)
            }
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

export const getExpenses = async () => {
    const response = await axios.get(`${BASE_URL}/expenses`)
    return response.data
}

export const createExpense = async (expenseData) => {
    const response = await axios.post(`${BASE_URL}/expenses`, expenseData)
    return response.data
}

export const deleteExpense = async (id) => {
    const response = await axios.delete(`${BASE_URL}/expenses/${id}`)
    return response.data
}

export const updateExpense = async (id, expenseData) => {
    const response = await axios.put(`${BASE_URL}/expenses/${id}`, expenseData)
    return response.data
}

// User Authentications
export const loginUser = async (credentials) => {
    const response = await axios.post(`${BASE_URL}/users/login`, credentials)
    return response.data
}

export const registerUser = async (userData) => {
    const response = await axios.post(`${BASE_URL}/users/register`, userData)
    return response.data
}