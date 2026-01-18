import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Article() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentName, setCommentName] = useState(localStorage.getItem("sinapsis_name")||"");
  const [commentEmail, setCommentEmail] = useState(localStorage.getItem("sinapsis_email")||"");
  const [commentText, setCommentText] = useState("");

  useEffect(()=>{
    load();
  },[id]);

  async function load(){
    setLoading(true);
    try {
      const { data, error } = await supabase.from("articulos").select("*").eq("id", id).single();
      if (error) throw error;
      setArticle(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function reactParagraph(tipo, extracto) {
    try {
      await supabase.from("sinapsis_reacciones").insert([{
        articulo_id: id,
        tipo_reaccion: tipo,
        extracto,
        usuario_nombre: commentName || "Anónimo",
        usuario_email: commentEmail || null,
        fecha: new Date().toISOString()
      }]);
      alert("Reacción enviada");
    } catch (err) {
      console.error(err);
      alert("Error registrando reacción");
    }
  }

  async function sendComment(e){
    e.preventDefault();
    if(!commentName || !commentEmail || !commentText) return alert("Complete nombre, correo y comentario");
    localStorage.setItem("sinapsis_name", commentName);
    localStorage.setItem("sinapsis_email", commentEmail);

    try {
      await supabase.from("dashboard_intervenciones").insert([{
        articulo_id: id,
        articulo_titulo: article.titulo,
        tipo_accion: "comentario",
        contenido: commentText,
        usuario_nombre: commentName,
        usuario_email: commentEmail,
        fecha: new Date().toISOString()
      }]);

      // Call edge function to send email to author (if configured)
      try {
        await fetch("/api/sendComment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            articulo_id: id,
            comentario: commentText,
            autor_email: article.autor_email || null,
            autor: article.autor || null
          })
        });
      } catch (err) {
        // Not blocking: maybe not deployed
        console.warn("sendComment edge function not available", err);
      }

      setCommentText("");
      alert("Comentario enviado. Gracias.");
    } catch (err) {
      console.error(err);
      alert("Error al enviar comentario");
    }
  }

  if (loading) return <div className="container"><div className="card">Cargando...</div></div>;
  if (!article) return <div className="container"><div className="card">Artículo no encontrado</div></div>;

  const sections = article.secciones && Array.isArray(article.secciones) ? article.secciones : [{ titulo: "Contenido", contenido: article.contenido || "" }];

  return (
    <div className="container">
      <div className="card">
        <h2>{article.titulo}</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <img src={article.autor_foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(article.autor||"Autor")}`} alt={article.autor} style={{ width:80,height:80,borderRadius:80 }} />
          <div>
            <strong style={{ color: "var(--orange)" }}>{article.autor}</strong>
            <div className="small">{article.afiliacion}</div>
            <div className="small">DOI: {article.doi || "—"}</div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <h4>Resumen</h4>
          <p className="small">{article.resumen}</p>
        </div>

        <div style={{ marginTop: 16 }}>
          <h4>Palabras clave</h4>
          <div className="small">{(article.keywords || []).join(", ")}</div>
        </div>

        <div style={{ marginTop: 20 }}>
          {sections.map((s, idx) => (
            <section key={idx} style={{ marginBottom: 18 }}>
              <h4>{s.titulo}</h4>
              {s.contenido.split("\n\n").map((para, pi) => (
                <div key={pi} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 8 }}>
                  <p className="p-text" style={{ margin: 0, flex: 1, color: "#d1d5db" }}>{para}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <button className="btn" onClick={()=>reactParagraph("Interesante", para)}>💡</button>
                    <button className="btn" onClick={()=>reactParagraph("Debatible", para)}>⚖️</button>
                    <button className="btn" onClick={()=>reactParagraph("Duda", para)}>🔍</button>
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>

        <div style={{ marginTop: 12 }}>
          <h4>Bibliografía</h4>
          {(article.bibliografia || []).map((b, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom:6 }}>
              <div className="small">{b}</div>
              <div>
                <button className="btn" onClick={async()=>{ await supabase.from("sinapsis_bibliografia_reacciones").insert([{ articulo_id: id, referencia: b, etiqueta: "Relevante", usuario: commentName||"Anónimo" }]); alert("Registrado"); }}>Relevante</button>
                <button className="btn" style={{ marginLeft:6 }} onClick={async()=>{ await supabase.from("sinapsis_bibliografia_reacciones").insert([{ articulo_id: id, referencia: b, etiqueta: "Sesgo", usuario: commentName||"Anónimo" }]); alert("Registrado"); }}>Sesgo</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20 }}>
          <h4>Comentario público</h4>
          <form onSubmit={sendComment}>
            <input required placeholder="Nombre" value={commentName} onChange={e=>setCommentName(e.target.value)} style={{width:"100%",padding:8,borderRadius:6,marginBottom:8}}/>
            <input required placeholder="Correo" type="email" value={commentEmail} onChange={e=>setCommentEmail(e.target.value)} style={{width:"100%",padding:8,borderRadius:6,marginBottom:8}}/>
            <textarea required placeholder="Tu comentario" value={commentText} onChange={e=>setCommentText(e.target.value)} style={{width:"100%",padding:8,borderRadius:6,marginBottom:8}} rows={6} />
            <button className="btn" type="submit">Enviar comentario</button>
          </form>
        </div>
      </div>
    </div>
  );
}
