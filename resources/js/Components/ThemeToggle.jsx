import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

/**
 * Manual light/dark switch. Reads the `.dark` class the pre-paint script in
 * app.blade.php already applied (from a saved preference or the OS setting),
 * then on click writes an explicit choice to localStorage so it sticks
 * across reloads and stops following OS changes.
 */
export default function ThemeToggle({ className = 'text-current hover:bg-black/5 dark:hover:bg-white/10' }) {
    const [isDark, setIsDark] = useState(
        () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
    );

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
    }, [isDark]);

    const toggle = () => {
        const next = !isDark;
        setIsDark(next);
        try {
            localStorage.setItem('theme', next ? 'dark' : 'light');
        } catch (e) {
            // Storage unavailable (private mode, etc.) — theme just won't persist.
        }
    };

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`p-2 rounded-full transition-colors ${className}`}
        >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
    );
}
