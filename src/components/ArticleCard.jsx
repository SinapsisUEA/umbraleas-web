import React from "react";

export default function ArticleCard({ article, onOpen }) {
  const { titulo, autor, afiliacion, portada_url, autor_foto_url, autor_orcid } = article;
  return (
    <div className="card" onClick={onOpen} style={{ cursor: "pointer" }}>
      <div style={{ display: "flex", gap: 12 }}>
        <img src={portada_url || `https://picsum.photos/seed/${article.id}/200/260`} alt={titulo} style={{ width: 110, height: 150, objectFit: "cover", borderRadius: 8 }} />
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: "0 0 8px 0" }}>{titulo}</h4>
          <p className="small">{autor} {autor_orcid? `(ORCID: ${autor_orcid})` : ""}</p>
          <p className="small" style={{ color: "#9aa5b1" }}>{afiliacion}</p>
        </div>
      </div>
    </div>
  );
}
