export function getErrorMessage(err) {
  const d = err?.response?.data;
  if (!d) return err?.message || "요청 실패";

  if (typeof d === "string") return d;

  if (d.detail) {
    if (Array.isArray(d.detail)) {
      return d.detail.map((x) => x.msg).join(", ");
    }
    if (typeof d.detail === "string") return d.detail;
  }

  try {
    return JSON.stringify(d);
  } catch {
    return "요청 실패";
  }
}