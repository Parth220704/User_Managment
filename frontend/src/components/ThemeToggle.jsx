import { useTheme } from '../state/theme'

function SunIcon(props) {
	return (
		<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
			<path
				fill="currentColor"
				d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0-16a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 18a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1ZM4 11a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2h1Zm18 0a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2h1ZM5.64 5.64a1 1 0 0 1 1.42 0l.7.7a1 1 0 1 1-1.41 1.42l-.71-.7a1 1 0 0 1 0-1.42Zm12.02 12.02a1 1 0 0 1 1.42 0l.7.71a1 1 0 0 1-1.42 1.41l-.7-.7a1 1 0 0 1 0-1.42ZM18.36 5.64a1 1 0 0 1 0 1.42l-.71.7a1 1 0 1 1-1.41-1.42l.7-.7a1 1 0 0 1 1.42 0ZM7.76 16.24a1 1 0 0 1 0 1.42l-.7.7a1 1 0 1 1-1.42-1.41l.7-.71a1 1 0 0 1 1.42 0Z"
			/>
		</svg>
	)
}

function MoonIcon(props) {
	return (
		<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
			<path fill="currentColor" d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5Z" />
		</svg>
	)
}

export function ThemeToggle() {
	const { theme, toggleTheme } = useTheme()
	return (
		<button
			className="btn secondary iconBtn themeFab"
			onClick={toggleTheme}
			type="button"
			title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
			aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
		>
			{theme === 'dark' ? <SunIcon /> : <MoonIcon />}
		</button>
	)
}
