import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  // 主题切换组件（中文注释）：在本地存储保存主题，默认跟随系统
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || '')

  useEffect(() => {
    const sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const applied = theme || (sysDark ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', applied)
  }, [theme])

  const toggle = () => {
    const next = (document.documentElement.getAttribute('data-theme') === 'dark') ? 'light' : 'dark'
    localStorage.setItem('theme', next)
    setTheme(next)
  }

  return (
    <button className="toggle" onClick={toggle} aria-label="Toggle theme">
      {document.documentElement.getAttribute('data-theme') === 'dark' ? 'Light' : 'Dark'} Mode
    </button>
  )
}