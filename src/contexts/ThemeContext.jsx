import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const THEMES = [
  {
    id: 'archive',
    name: 'Archive',
    description: 'Warm paper · archival ink',
    themeColor: '#171717',
    swatches: ['#fcfcf7', '#171717', '#943700'],
  },
  {
    id: 'institute-blue',
    name: 'Institute Blue',
    description: 'Cool paper · deep navy',
    themeColor: '#14315e',
    swatches: ['#f7f9fc', '#14315e', '#0e7490'],
  },
  {
    id: 'slate-mist',
    name: 'Slate Mist',
    description: 'Soft neutral · sky accent',
    themeColor: '#1e293b',
    swatches: ['#f8fafc', '#1e293b', '#0369a1'],
  },
  {
    id: 'sage-commons',
    name: 'Sage Commons',
    description: 'Green paper · forest ink',
    themeColor: '#2f4a34',
    swatches: ['#f6f8f4', '#2f4a34', '#8a6d1f'],
  },
  {
    id: 'heritage-claret',
    name: 'Heritage Claret',
    description: 'Cream paper · claret ink',
    themeColor: '#6b1f2a',
    swatches: ['#fdf8f4', '#6b1f2a', '#b8860b'],
  },
];

const STORAGE_KEY = 'crest_theme';
const DEFAULT_THEME = 'archive';
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && THEMES.some((t) => t.id === stored)) return stored;
    } catch {
      // ignore — localStorage unavailable
    }
    return DEFAULT_THEME;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore — write blocked (private mode)
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    const preset = THEMES.find((t) => t.id === theme);
    if (meta && preset) meta.setAttribute('content', preset.themeColor);
  }, [theme]);

  const setTheme = useCallback((id) => {
    if (THEMES.some((t) => t.id === id)) setThemeState(id);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react/only-export-components
export const useTheme = () => useContext(ThemeContext);
