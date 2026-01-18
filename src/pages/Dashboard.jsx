import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Chart from "chart.js/auto";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [reactions, setReactions] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [articles, setArticles] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(()=> {
    // Protect with Supabase Auth: redirect to login if not authenticated
    const session = supabase.auth.getSession ? null : null; // client side can use supabase.auth.getSession() in full implementation
    // For brevity: ask user to login via magic link (not implemented fully here)
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const { data: re, error: er } = await supabase.from("sinapsis_reacciones").select("*");
      if (!er) setReactions(re || []);
      const { data: inx } = await supabase.from("dashboard_intervenciones").select("*").order("fecha", { ascending: false }).limit(200);
      setInterventions(inx || []);
      const { data: arts } = await supabase.from("articulos").select("id,titulo,autor");
      setArticles(arts || []);
    } catch (err) {
      console.error(err);
      alert("Error cargando datos de dashboard");
    }
  }

  function exportPDF() {
    import("jspdf").then(({ jsPDF }) => {
      const doc = new jsPDF();
      doc.text("Reporte Sinapsis", 10, 10);
      doc.text(`Reacciones totales: ${reactions.length}`, 10, 20);
      doc.text(`Intervenciones totales: ${interventions.length}`, 10, 30);
      doc.save("reporte-sinapsis.pdf");
    });
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Búnker de Inteligencia — Dashboard</h2>
        <p className="small">Panel de control de reacciones, intervenciones y temas emergentes</p>

        <div style={{ marginTop: 12 }}>
          <button className="btn" onClick={exportPDF}>📄 Generar reporte (PDF)</button>
        </div>

        <div style={{ marginTop: 20 }}>
          <h4>Estadísticas</h4>
          <div className="grid">
            <div className="card">
              <div className="small">Reacciones totales</div>
              <div style={{ fontSize: 22, marginTop: 8 }}>{reactions.length}</div>
            </div>
            <div className="card">
              <div className="small">Intervenciones</div>
              <div style={{ fontSize: 22, marginTop: 8 }}>{interventions.length}</div>
            </div>
            <div className="card">
              <div className="small">Artículos</div>
              <div style={{ fontSize: 22, marginTop: 8 }}>{articles.length}</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <h4>Últimas intervenciones</h4>
          <div>
            {interventions.slice(0,20).map(i => (
              <div key={i.id} style={{ padding: 8, borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <div style={{ fontWeight: "bold", color: "var(--orange)" }}>{i.usuario_nombre || "Anónimo"}</div>
                <div className="small">{i.contenido}</div>
                <div className="small">{new Date(i.fecha).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
