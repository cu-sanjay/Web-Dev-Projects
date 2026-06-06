import React from 'react'
import useTheme from '../context/ThemeContext'

export default function ThemeBtn() {
    const {themeMode, darkTheme, lightTheme} = useTheme();

    const onChangeTheme = (e) => {
        const darkModeStatus = e.target.checked;
        if(darkModeStatus){
            darkTheme();
        } else {
            lightTheme();
        }
    }

    return (
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors duration-200 hover:border-amber-300 hover:text-amber-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-amber-400">
            <input
                type="checkbox"
                value=""
                className="sr-only peer"
                onChange={onChangeTheme}
                checked={themeMode === "dark"}
            />
            <span className="text-xs font-bold leading-none">{themeMode === "dark" ? "D" : "L"}</span>
            <span>{themeMode === "dark" ? "Dark" : "Light"}</span>
        </label>
    );
}

