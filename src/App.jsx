import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Article from "./pages/Article";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <div className="app-root">
      <header className="site-header">
        <div className="header-inner">
          <h1 className="site-title">Sinapsis</h1>
          <nav className="main-nav">
            <Link to="/">Inicio</Link>
            <a href="#quienes">Quiénes somos</a>
            <a href="#politicas">Políticas editoriales</a>
            <a href="#contacto">Contacto</a>
            <Link to="/dashboard" className="dash-link">Búnker</Link>
          </nav>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/article/:id" element={<Article />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <small>© {new Date().getFullYear()} Sinapsis — Umbral de la Estrategia Asimétrica</small>
      </footer>
    </div>
  );
}
