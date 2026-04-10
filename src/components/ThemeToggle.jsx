import { useState, useEffect } from 'react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <button 
      className="theme-toggle-btn" 
      onClick={toggleTheme}
      title={theme === 'light' ? 'Modo Noche' : 'Modo Día'}
    >
      {theme === 'light' ? (
        <i className="bi bi-moon-stars-fill"></i>
      ) : (
        <i className="bi bi-sun-fill"></i>
      )}
    </button>
  );
};

export default ThemeToggle;
