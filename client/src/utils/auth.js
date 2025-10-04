import { api } from "../api/client";

export async function restoreSession() {
  const t = localStorage.getItem("access_token");
  if (!t) return null;
  try {
    const { data } = await api.get("/auth/me");
    return data;
  } catch {
    localStorage.removeItem("access_token");
    return null;
  }
}

export function logout(navigate) {
  localStorage.removeItem("access_token");
  navigate("/login");
}