import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export function createApiClient({ getToken }) {
	const client = axios.create({
		baseURL: apiBaseUrl,
		timeout: 20000,
	})

	client.interceptors.request.use((config) => {
		const token = getToken?.()
		if (token) {
			config.headers = config.headers || {}
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	})

	return client
}
