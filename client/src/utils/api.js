// client/src/utils/api.js (최종 수정 코드)

export const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function handle(res) {
    if (res.ok) return res.json();
    let t = await res.text().catch(() => "");
    try { const j = JSON.parse(t); t = j.detail || t; } catch {}
    throw new Error(`${res.status} ${t || res.statusText}`);
}

export async function getLatest() {
    return handle(await fetch(`${API_BASE}/lotto/latest-draw`));
}

export async function getHistory(limit = 5) {
    return handle(await fetch(`${API_BASE}/lotto/history?limit=${limit}`));
}

export async function getRecommend(nSets = 3) {
    return handle(await fetch(`${API_BASE}/lotto/recommend?n_sets=${nSets}`));
}