import { useTheme } from '../ThemeContext'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-pressed={theme === 'light'}
      aria-label={
        theme === 'dark' ? 'Activate light theme' : 'Activate dark theme'
      }
    >
      {theme === 'dark' ? 'Light theme' : 'Dark theme'}
    </button>
  )
}
