const envBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
export const API_BASE = envBase || '';

async function handle(res) {
    if (res.ok) return res.json();
    let t = await res.text().catch(() => "");
    try { const j = JSON.parse(t); t = j.detail || t; } catch {}
    throw new Error(`${res.status} ${t || res.statusText}`);
}

// ===== 기존 lotto API =====
export async function getLatest() {
    return handle(await fetch(`${API_BASE}/lotto/latest-draw`));
}

export async function getHistory(limit = 5) {
    return handle(await fetch(`${API_BASE}/lotto/history?limit=${limit}`));
}

export async function getRecommend(nSets = 3) {
    return handle(await fetch(`${API_BASE}/lotto/recommend?n_sets=${nSets}`));
}

// ===== 새로운 retailers API =====
export async function getTopRetailers(limit = 20) {
    return handle(await fetch(`${API_BASE}/retailers/top?limit=${limit}`));
}

export async function searchRetailers(region) {
    return handle(await fetch(`${API_BASE}/retailers/search?region=${encodeURIComponent(region)}`));
}