import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)

const STORAGE_KEY = 'ums_theme'

function getInitialTheme() {
	const saved = localStorage.getItem(STORAGE_KEY)
	if (saved === 'light' || saved === 'dark') return saved
	return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
	const [theme, setTheme] = useState(getInitialTheme)

	useEffect(() => {
		const root = document.documentElement
		root.dataset.theme = theme
		localStorage.setItem(STORAGE_KEY, theme)
	}, [theme])

	const value = useMemo(
		() => ({
			theme,
			setTheme,
			toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
		}),
		[theme],
	)

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
	const ctx = useContext(ThemeContext)
	if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
	return ctx
}
