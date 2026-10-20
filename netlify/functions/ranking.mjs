// Ranking compartido del crucigrama. Guarda un registro por jugador en Netlify Blobs.
// GET    /api/ranking  -> lista ordenada
// POST   /api/ranking  -> registra el PRIMER intento de cada jugador
// DELETE /api/ranking  -> reinicia (requiere encabezado x-admin-pin = ADMIN_PIN)
import { getStore } from "@netlify/blobs";

const TOTAL_WORDS = 14;
const MAX_SCORE = TOTAL_WORDS * 100 + 3 * 50 + 300; // palabras + vidas + bonus de tiempo
const MAX_TIME_MS = 10 * 60 * 1000;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const int = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;

async function readAll(store) {
  const { blobs } = await store.list({ prefix: "p-" });
  const rows = await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })));
  return rows
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.timeMs - b.timeMs || a.at - b.at);
}

function adminPin() {
  const fromNetlify = globalThis.Netlify?.env?.get?.("ADMIN_PIN");
  return fromNetlify || process.env.ADMIN_PIN || "sbok11";
}

export default async (req) => {
  const store = getStore({ name: "ranking-sbok-cap11", consistency: "strong" });

  if (req.method === "GET") {
    const players = (await readAll(store)).map(({ id, name, score, solved, lives, timeMs }) => ({
      id, name, score, solved, lives, timeMs,
    }));
    return json({ players });
  }

  if (req.method === "POST") {
    let b;
    try {
      b = await req.json();
    } catch {
      return json({ error: "JSON inválido" }, 400);
    }
    const id = typeof b.id === "string" ? b.id.trim() : "";
    const name = typeof b.name === "string" ? b.name.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, 20) : "";
    if (!/^[A-Za-z0-9-]{6,64}$/.test(id) || name.length < 2) return json({ error: "Datos incompletos" }, 400);
    if (!int(b.score, 0, MAX_SCORE) || !int(b.solved, 0, TOTAL_WORDS) || !int(b.lives, 0, 3) || !int(b.timeMs, 0, MAX_TIME_MS))
      return json({ error: "Valores fuera de rango" }, 400);

    const key = `p-${id}`;
    const prev = await store.get(key, { type: "json" });
    if (!prev) {
      await store.setJSON(key, { id, name, score: b.score, solved: b.solved, lives: b.lives, timeMs: b.timeMs, at: Date.now() });
    }
    const all = await readAll(store);
    const rank = all.findIndex((p) => p.id === id) + 1;
    return json({ ok: true, firstAttemptKept: Boolean(prev), rank, total: all.length });
  }

  if (req.method === "DELETE") {
    if (req.headers.get("x-admin-pin") !== adminPin()) return json({ error: "PIN incorrecto" }, 403);
    const { blobs } = await store.list({ prefix: "p-" });
    await Promise.all(blobs.map((b) => store.delete(b.key)));
    return json({ ok: true, deleted: blobs.length });
  }

  return json({ error: "Método no permitido" }, 405);
};

export const config = { path: "/api/ranking" };
