// Placeholder client for Deepseek semantic search.
// Replace fetchUrl / API pattern according to Deepseek's docs.
// Keep the key on server-side in production.

const DEEPSEEK_KEY = import.meta.env.VITE_DEEPSEEK_KEY || "";

export async function semanticSearch(query) {
  if (!DEEPSEEK_KEY) {
    console.warn("Deepseek key missing — falling back to empty result");
    return [];
  }

  // Example fetch skeleton (adjust to Deepseek API)
  try {
    const res = await fetch("https://api.deepseek.example/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_KEY}`
      },
      body: JSON.stringify({ query, topK: 10 })
    });
    if (!res.ok) throw new Error("Deepseek error");
    const json = await res.json();
    return json.results || [];
  } catch (err) {
    console.error("Deepseek error:", err);
    return [];
  }
}
