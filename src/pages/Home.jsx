import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import ArticleCard from "../components/ArticleCard";
import { semanticSearch } from "../lib/deepseek";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadArticles();
  }, []);

  async function loadArticles() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("articulos")
        .select("id, titulo, autor, afiliacion, portada_url, autor_foto_url, autor_orcid")
        .order("id", { ascending: false })
        .limit(50);

      if (error) throw error;
      setArticles(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!query) return loadArticles();

    // Try semantic search first
    const sem = await semanticSearch(query);
    if (Array.isArray(sem) && sem.length) {
      // assume sem contains artículo ids or metadata
      const ids = sem.map((s) => s.id).filter(Boolean);
      if (ids.length) {
        const { data } = await supabase
          .from("articulos")
          .select("id, titulo, autor, afiliacion, portada_url, autor_foto_url, autor_orcid")
          .in("id", ids);
        setArticles(data || []);
        return;
      }
    }

    // Fallback: Postgres full-text search
    try {
      const { data, error } = await supabase.rpc("search_articulos", { p_query: query });
      if (!error && data) setArticles(data);
      else {
        // simple filter fallback
        const { data: all } = await supabase.from("articulos").select("id, titulo, autor, afiliacion, portada_url, autor_foto_url, autor_orcid");
        const filtered = (all || []).filter(a =>
          (a.titulo || "").toLowerCase().includes(query.toLowerCase()) ||
          (a.autor || "").toLowerCase().includes(query.toLowerCase())
        );
        setArticles(filtered);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="container">
      <section className="card">
        <h2>Sinapsis — Umbral de la Estrategia Asimétrica</h2>
        <p className="small">Revista Interdisciplinaria de Seguridad Ciudadana y de la Nación</p>

        <form onSubmit={handleSearch} style={{ marginTop: 16 }}>
          <input className="search-box" placeholder="Buscar en la revista..." value={query} onChange={(e)=>setQuery(e.target.value)} />
        </form>

        <div style={{ marginTop: 20 }}>
          <h3>Simposio Internacional</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 12 }}>
            <div className="card">
              <img src="/simposio-banner.jpg" alt="Simposio" style={{ width: "100%", borderRadius: 8 }} />
              <p>Inscríbete y participa en la definición de temas estratégicos.</p>
            </div>

            <div className="card">
              <h4>Inscripción</h4>
              <InscriptionForm />
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 12 }}>Artículos destacados</h3>
        {loading ? <div className="card small">Cargando...</div> : (
          <div className="grid">
            {articles.map(a => <ArticleCard key={a.id} article={a} onOpen={() => navigate(`/article/${a.id}`)} />)}
          </div>
        )}
      </section>

      <section style={{ marginTop: 28 }}>
        <h3>Sinapsis Asimétrica Mediática</h3>
        <div className="grid">
          <div className="card">
            <h4>Programas</h4>
            <ul>
              <li>La raíz del riesgo</li>
              <li>Geopolítica del Ciberespacio y el Discurso</li>
              <li>Mapeando el Mañana</li>
            </ul>
          </div>
          <div className="card">
            <h4>Podcasts</h4>
            <ul>
              <li>Desafíos</li>
              <li>Diccionario de la Asimetría</li>
              <li>Umbrales digitales y analógicos</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function InscriptionForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inst, setInst] = useState("");
  const [status, setStatus] = useState(null);

  async function handleSubmit(ev) {
    ev.preventDefault();
    setStatus("pending");
    try {
      const { error } = await supabase.from("contactos_simposio").upsert({ nombre: name, email, institucion: inst }, { onConflict: "email" });
      await supabase.from("dashboard_intervenciones").insert([{
        tipo_accion: "registro",
        usuario_nombre: name,
        usuario_email: email,
        usuario_institucion: inst,
        contenido: "Inscripción al Simposio vía web",
        fecha: new Date().toISOString()
      }]);
      if (error) throw error;
      setStatus("ok");
      setName(""); setEmail(""); setInst("");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input required placeholder="Nombre y Apellido" value={name} onChange={e=>setName(e.target.value)} style={{width:"100%",marginBottom:8,padding:8,borderRadius:6}}/>
      <input required type="email" placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)} style={{width:"100%",marginBottom:8,padding:8,borderRadius:6}}/>
      <input placeholder="Institución" value={inst} onChange={e=>setInst(e.target.value)} style={{width:"100%",marginBottom:8,padding:8,borderRadius:6}}/>
      <button className="btn" type="submit">Activar Acceso</button>
      <div style={{marginTop:8}}>{status==="ok"?"Inscripción registrada ✅": status==="error"?"Error":" "}</div>
    </form>
  );
}
