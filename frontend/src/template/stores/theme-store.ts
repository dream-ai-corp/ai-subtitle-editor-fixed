import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';

export interface Theme {
  id: string;
  name: string;
  isDark: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    dark: string;
    darkPage: string;
    positive: string;
    negative: string;
    info: string;
    warning: string;
  };
  custom?: Record<string, string>;
}

export const useThemeStore = defineStore('theme', () => {
  // Available themes
  const themes = ref<Theme[]>([
    {
      id: 'luxury-light',
      name: 'Luxury Light',
      isDark: false,
      colors: {
        primary: '#1e293b', // Deep slate
        secondary: '#334155', // Medium slate
        accent: '#0f172a', // Darkest slate
        dark: '#1e293b',
        darkPage: '#fafafa', // Very light gray
        positive: '#059669', // Emerald
        negative: '#dc2626', // Red
        info: '#2563eb', // Blue
        warning: '#d97706', // Amber
      },
      custom: {
        surface: '#ffffff',
        'surface-variant': '#f8fafc',
        'on-surface': '#0f172a',
        'on-surface-variant': '#475569',
        outline: '#e2e8f0',
        'outline-variant': '#cbd5e1',
        shadow: 'rgba(0, 0, 0, 0.08)',
        'shadow-elevation': 'rgba(0, 0, 0, 0.06)',
        'gradient-primary': 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        'gradient-accent': 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
        'gradient-danger': 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%)',
        'gradient-luxury':
          'linear-gradient(135deg, #1e293b 0%, #334155 25%, #475569 50%, #64748b 75%, #94a3b8 100%)',
        'border-radius': '16px',
        'border-radius-small': '12px',
        'border-radius-large': '24px',
        'shadow-sm': '0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'shadow-md': '0 8px 16px -4px rgba(0, 0, 0, 0.1), 0 4px 8px -2px rgba(0, 0, 0, 0.06)',
        'shadow-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'shadow-xl': '0 25px 50px -12px rgba(0, 0, 0, 0.12), 0 12px 24px -6px rgba(0, 0, 0, 0.08)',
        'shadow-2xl': '0 35px 60px -12px rgba(0, 0, 0, 0.15), 0 20px 40px -8px rgba(0, 0, 0, 0.1)',
      },
    },
    {
      id: 'luxury-dark',
      name: 'Luxury Dark',
      isDark: true,
      colors: {
        primary: '#fbbf24', // Amber 400
        secondary: '#f59e0b', // Amber 500
        accent: '#d97706', // Amber 600
        dark: '#0f172a', // Slate 900
        darkPage: '#020617', // Slate 950
        positive: '#10b981', // Emerald 500
        negative: '#ef4444', // Red 500
        info: '#3b82f6', // Blue 500
        warning: '#f59e0b', // Amber 500
      },
      custom: {
        surface: '#1e293b', // Slate 800
        'surface-variant': '#334155', // Slate 700
        'on-surface': '#f8fafc', // Slate 50
        'on-surface-variant': '#cbd5e1', // Slate 300
        outline: '#475569', // Slate 600
        'outline-variant': '#64748b', // Slate 500
        shadow: 'rgba(0, 0, 0, 0.4)',
        'shadow-elevation': 'rgba(0, 0, 0, 0.35)',
        'gradient-primary': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
        'gradient-accent': 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
        'gradient-danger': 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
        'gradient-luxury':
          'linear-gradient(135deg, #fbbf24 0%, #f59e0b 25%, #d97706 50%, #b45309 75%, #92400e 100%)',
        'border-radius': '16px',
        'border-radius-small': '12px',
        'border-radius-large': '24px',
        'shadow-sm': '0 2px 4px 0 rgba(0, 0, 0, 0.4)',
        'shadow-md': '0 8px 16px -4px rgba(0, 0, 0, 0.5), 0 4px 8px -2px rgba(0, 0, 0, 0.4)',
        'shadow-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
        'shadow-xl': '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 12px 24px -6px rgba(0, 0, 0, 0.5)',
        'shadow-2xl': '0 35px 60px -12px rgba(0, 0, 0, 0.7), 0 20px 40px -8px rgba(0, 0, 0, 0.6)',
      },
    },
    {
      id: 'premium-light',
      name: 'Premium Light',
      isDark: false,
      colors: {
        primary: '#1a1a2e', // Deep navy blue
        secondary: '#16213e', // Dark blue-gray
        accent: '#0f3460', // Rich blue
        dark: '#1a1a2e',
        darkPage: '#f8fafc', // Very light gray
        positive: '#10b981', // Emerald green
        negative: '#ef4444', // Red
        info: '#3b82f6', // Blue
        warning: '#f59e0b', // Amber
      },
      custom: {
        surface: '#ffffff',
        'surface-variant': '#f1f5f9',
        'on-surface': '#1e293b',
        'on-surface-variant': '#64748b',
        outline: '#e2e8f0',
        'outline-variant': '#cbd5e1',
        shadow: 'rgba(0, 0, 0, 0.1)',
        'shadow-elevation': 'rgba(0, 0, 0, 0.08)',
        'gradient-primary': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)',
        'gradient-accent': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'gradient-danger': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'border-radius': '12px',
        'border-radius-small': '8px',
        'border-radius-large': '16px',
        'shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
    {
      id: 'premium-dark',
      name: 'Premium Dark',
      isDark: true,
      colors: {
        primary: '#6366f1', // Indigo
        secondary: '#8b5cf6', // Violet
        accent: '#06b6d4', // Cyan
        dark: '#0f172a', // Slate 900
        darkPage: '#020617', // Slate 950
        positive: '#10b981', // Emerald
        negative: '#ef4444', // Red
        info: '#3b82f6', // Blue
        warning: '#f59e0b', // Amber
      },
      custom: {
        surface: '#1e293b', // Slate 800
        'surface-variant': '#334155', // Slate 700
        'on-surface': '#f1f5f9', // Slate 100
        'on-surface-variant': '#cbd5e1', // Slate 300
        outline: '#475569', // Slate 600
        'outline-variant': '#64748b', // Slate 500
        shadow: 'rgba(0, 0, 0, 0.3)',
        'shadow-elevation': 'rgba(0, 0, 0, 0.25)',
        'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
        'gradient-accent': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'gradient-danger': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'border-radius': '12px',
        'border-radius-small': '8px',
        'border-radius-large': '16px',
        'shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        'shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        'shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
      },
    },
    {
      id: 'trading-light',
      name: 'Trading Light',
      isDark: false,
      colors: {
        primary: '#059669', // Emerald 600
        secondary: '#dc2626', // Red 600
        accent: '#2563eb', // Blue 600
        dark: '#1e293b',
        darkPage: '#f8fafc',
        positive: '#059669', // Emerald 600
        negative: '#dc2626', // Red 600
        info: '#2563eb', // Blue 600
        warning: '#d97706', // Amber 600
      },
      custom: {
        surface: '#ffffff',
        'surface-variant': '#f1f5f9',
        'on-surface': '#1e293b',
        'on-surface-variant': '#64748b',
        outline: '#e2e8f0',
        'outline-variant': '#cbd5e1',
        shadow: 'rgba(0, 0, 0, 0.1)',
        'shadow-elevation': 'rgba(0, 0, 0, 0.08)',
        'gradient-primary': 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        'gradient-accent': 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        'gradient-danger': 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        'border-radius': '12px',
        'border-radius-small': '8px',
        'border-radius-large': '16px',
        'shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
    {
      id: 'trading-dark',
      name: 'Trading Dark',
      isDark: true,
      colors: {
        primary: '#10b981', // Emerald 500
        secondary: '#ef4444', // Red 500
        accent: '#3b82f6', // Blue 500
        dark: '#0f172a',
        darkPage: '#020617',
        positive: '#10b981', // Emerald 500
        negative: '#ef4444', // Red 500
        info: '#3b82f6', // Blue 500
        warning: '#f59e0b', // Amber 500
      },
      custom: {
        surface: '#1e293b',
        'surface-variant': '#334155',
        'on-surface': '#f1f5f9',
        'on-surface-variant': '#cbd5e1',
        outline: '#475569',
        'outline-variant': '#64748b',
        shadow: 'rgba(0, 0, 0, 0.3)',
        'shadow-elevation': 'rgba(0, 0, 0, 0.25)',
        'gradient-primary': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'gradient-accent': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        'gradient-danger': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'border-radius': '12px',
        'border-radius-small': '8px',
        'border-radius-large': '16px',
        'shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        'shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        'shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
      },
    },
  ]);

  // Current theme
  const currentThemeId = ref('luxury-light');

  // Computed current theme
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentTheme = computed(() => {
    return themes.value.find((theme) => theme.id === currentThemeId.value) || themes.value[0];
  });

  // Actions
  const setTheme = (themeId: string) => {
    const theme = themes.value.find((t) => t.id === themeId);
    if (theme) {
      currentThemeId.value = themeId;
      applyTheme(theme);
      saveToLocalStorage();
    }
  };

  const applyTheme = (theme: Theme) => {
    // Apply CSS custom properties
    const root = document.documentElement;

    // Apply colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--q-${key}`, value);
    });

    // Apply custom properties
    if (theme.custom) {
      Object.entries(theme.custom).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
    }

    // Set dark mode
    document.body.classList.toggle('body--dark', theme.isDark);
  };

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('current-theme', currentThemeId.value);
    } catch (error) {
      console.error('Failed to save theme to localStorage:', error);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const savedTheme = localStorage.getItem('current-theme');
      if (savedTheme && themes.value.find((t) => t.id === savedTheme)) {
        currentThemeId.value = savedTheme;
        const theme = themes.value.find((t) => t.id === savedTheme);
        if (theme) {
          applyTheme(theme);
        }
      }
    } catch (error) {
      console.error('Failed to load theme from localStorage:', error);
    }
  };

  const addTheme = (theme: Theme) => {
    themes.value.push(theme);
    saveThemesToLocalStorage();
  };

  const removeTheme = (themeId: string) => {
    const index = themes.value.findIndex((t) => t.id === themeId);
    if (index !== -1) {
      // Don't allow removing the last theme
      if (themes.value.length <= 1) {
        throw new Error('Cannot remove the last theme');
      }

      themes.value.splice(index, 1);

      // If the removed theme was the current one, switch to the first available
      if (currentThemeId.value === themeId && themes.value.length > 0) {
        const firstTheme = themes.value[0];
        if (firstTheme) {
          currentThemeId.value = firstTheme.id;
          applyTheme(firstTheme);
        }
      }

      saveThemesToLocalStorage();
    }
  };

  const updateTheme = (updatedTheme: Theme) => {
    const index = themes.value.findIndex((t) => t.id === updatedTheme.id);
    if (index !== -1) {
      themes.value[index] = { ...updatedTheme };
      saveThemesToLocalStorage();

      // If this is the current theme, reapply it
      if (currentThemeId.value === updatedTheme.id) {
        applyTheme(updatedTheme);
      }
    }
  };

  const createTheme = (name: string, isDark: boolean = false): Theme => {
    const baseTheme = themes.value.find((t) => t.isDark === isDark) || themes.value[0];
    if (!baseTheme) {
      throw new Error('No base theme found');
    }
    const newTheme: Theme = {
      id: `custom-${Date.now()}`,
      name,
      isDark,
      colors: { ...baseTheme.colors },
      custom: { ...baseTheme.custom },
    };

    addTheme(newTheme);
    return newTheme;
  };

  const duplicateTheme = (theme: Theme): Theme => {
    const duplicatedTheme: Theme = {
      ...theme,
      id: `custom-${Date.now()}`,
      name: `${theme.name} (Copy)`,
    };

    addTheme(duplicatedTheme);
    return duplicatedTheme;
  };

  const exportTheme = (themeId: string): string => {
    const theme = themes.value.find((t) => t.id === themeId);
    if (!theme) {
      throw new Error('Theme not found');
    }
    return JSON.stringify(theme, null, 2);
  };

  const importTheme = (themeJson: string): boolean => {
    try {
      const theme = JSON.parse(themeJson) as Theme;

      // Validate theme structure
      if (!theme.id || !theme.name || !theme.colors || !theme.custom) {
        return false;
      }

      // Generate new ID to avoid conflicts
      theme.id = `imported-${Date.now()}`;

      addTheme(theme);
      return true;
    } catch (error) {
      console.error('Failed to import theme:', error);
      return false;
    }
  };

  const saveThemesToLocalStorage = () => {
    try {
      localStorage.setItem('themes', JSON.stringify(themes.value));
    } catch (error) {
      console.error('Failed to save themes to localStorage:', error);
    }
  };

  const loadThemesFromLocalStorage = () => {
    try {
      const savedThemes = localStorage.getItem('themes');
      if (savedThemes) {
        const parsedThemes = JSON.parse(savedThemes) as Theme[];
        if (Array.isArray(parsedThemes) && parsedThemes.length > 0) {
          themes.value = parsedThemes;
        }
      }
    } catch (error) {
      console.error('Failed to load themes from localStorage:', error);
    }
  };

  // Initialize
  loadThemesFromLocalStorage();
  loadFromLocalStorage();

  return {
    // State
    themes: readonly(themes),
    currentThemeId: readonly(currentThemeId),
    currentTheme: computed(() => themes.value.find((t) => t.id === currentThemeId.value)),

    // Actions
    setTheme,
    addTheme,
    removeTheme,
    updateTheme,
    createTheme,
    duplicateTheme,
    exportTheme,
    importTheme,
  };
});
