import React, { useState, useEffect } from "react";
import "./App.css";
import { useDispatch } from "react-redux";
import authService from "./appwrite/auth";
import { login, logout } from "./store/authSlice";
import { Outlet } from "react-router-dom";
import { Footer } from "./components/index";
import { Header } from "./components/index";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const [themeMode, setThemeMode] = useState("light");

  const darkTheme = () => {
    setThemeMode("dark");
  };

  const lightTheme = () => {
    setThemeMode("light");
  };

  useEffect(() => {
    document.querySelector("html").classList.remove("light", "dark");
    document.querySelector("html").classList.add(themeMode);
  }, [themeMode]);
  useEffect(() => {
    authService
      .getCurrentUser()
      .then((userData) => {
        if (userData) {
          dispatch(login({ userData }));
        } else {
          dispatch(logout());
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dispatch]);

  return !loading ? (
    <ThemeProvider value={{ themeMode, darkTheme, lightTheme }}>
      <div className="flex min-h-screen w-full flex-col bg-stone-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  ) : null;
}

export default App;
